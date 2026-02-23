import type { Job } from "@packages/database/jobs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";

import JobCard from "@/components/JobCard";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard/jobs/$jobId")({
  beforeLoad: ({ context, params }) => {
    const canViewJob =
      context.permissions.includes("LIST:jobs:all") ||
      (context.permissions.includes("LIST:jobs:assigned") &&
        !!context.userData.assignedJobs?.find(
          (j) => j.id.toString() === params.jobId,
        ));
    if (!canViewJob) {
      if (document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        throw redirect({ to: "/" });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { jobId } = Route.useParams();
  const { permissions } = Route.useRouteContext();
  const router = useRouter();
  const jobIdNum = Number(jobId);

  const jobQuery = useQuery(trpc.jobs.getById.queryOptions(jobIdNum));

  const { data: job, isLoading, error } = jobQuery;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div>
      <Link
        to="/dashboard/jobs"
        className="text-blue-500 hover:underline text-sm mb-3 inline-block"
      >
        &larr; Back to Jobs
      </Link>

      {!job ? (
        <p>Job not found.</p>
      ) : (
        <JobCard
          job={job}
          actions={
            <>
              {permissions.includes("WORK:job") && (
                <WorkActions job={job} onSuccess={() => jobQuery.refetch()} />
              )}
              {permissions.includes("ASSIGN:job") && (
                <AssignActions job={job} onSuccess={() => jobQuery.refetch()} />
              )}
              {permissions.includes("UPDATE:job") && (
                <EditAction job={job} onSuccess={() => jobQuery.refetch()} />
              )}
              {permissions.includes("DELETE:job") && (
                <DeleteAction
                  jobId={job.id}
                  onSuccess={async () => {
                    await router.navigate({ to: "/dashboard/jobs" });
                  }}
                />
              )}
            </>
          }
        />
      )}
    </div>
  );
}

// -- Work/Status transition actions --

type WorkableStatus = Exclude<Job["status"], "pending">;

const VALID_TRANSITIONS: Record<Job["status"], Array<WorkableStatus>> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_ACTION_LABELS: Record<WorkableStatus, string> = {
  in_progress: "Start Work",
  completed: "Complete",
  cancelled: "Cancel",
};

function WorkActions({ job, onSuccess }: { job: Job; onSuccess: () => void }) {
  const workMutation = useMutation(
    trpc.jobs.work.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error updating status: ${e.message}`);
      },
    }),
  );

  if (job.assignedTo == null) {
    return (
      <span className="text-sm text-gray-400 italic">
        Assign this job to enable status changes
      </span>
    );
  }

  const transitions = VALID_TRANSITIONS[job.status];
  if (transitions.length === 0) return null;

  return (
    <>
      {transitions.map((status) => (
        <button
          key={status}
          type="button"
          className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
          disabled={workMutation.isPending}
          onClick={() => workMutation.mutate({ jobId: job.id, status })}
        >
          {STATUS_ACTION_LABELS[status]}
        </button>
      ))}
    </>
  );
}

// -- Assign/Unassign actions --

function AssignActions({
  job,
  onSuccess,
}: {
  job: { id: number; assignedTo: number | null };
  onSuccess: () => void;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const [userId, setUserId] = useState("");

  const assignMutation = useMutation(
    trpc.jobs.assign.mutationOptions({
      onSuccess: () => {
        setShowAssign(false);
        setUserId("");
        onSuccess();
      },
      onError(e) {
        alert(`Error assigning job: ${e.message}`);
      },
    }),
  );

  const unassignMutation = useMutation(
    trpc.jobs.unassign.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error unassigning job: ${e.message}`);
      },
    }),
  );

  return (
    <>
      {job.assignedTo != null ? (
        <button
          type="button"
          className="px-3 py-1 rounded bg-yellow-400 hover:opacity-90 text-sm cursor-pointer"
          disabled={unassignMutation.isPending}
          onClick={() => unassignMutation.mutate(job.id)}
        >
          {unassignMutation.isPending ? "Unassigning..." : "Unassign"}
        </button>
      ) : !showAssign ? (
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
          onClick={() => setShowAssign(true)}
        >
          Assign
        </button>
      ) : (
        <span className="flex gap-1 items-center">
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border border-gray-300 rounded px-2 py-0.5 w-24 text-sm"
          />
          <button
            type="button"
            className="px-2 py-0.5 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
            disabled={assignMutation.isPending}
            onClick={() => {
              const id = Number(userId);
              if (!id || Number.isNaN(id)) {
                alert("Enter a valid user ID.");
                return;
              }
              assignMutation.mutate({ jobId: job.id, userId: id });
            }}
          >
            {assignMutation.isPending ? "Assigning..." : "Confirm"}
          </button>
          <button
            type="button"
            className="px-2 py-0.5 rounded hover:bg-gray-100 text-sm cursor-pointer"
            onClick={() => {
              setShowAssign(false);
              setUserId("");
            }}
          >
            Cancel
          </button>
        </span>
      )}
    </>
  );
}

// -- Edit action --

function EditAction({
  job,
  onSuccess,
}: {
  job: { id: number; title: string; description: string };
  onSuccess: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);

  const updateMutation = useMutation(
    trpc.jobs.update.mutationOptions({
      onSuccess: () => {
        setEditing(false);
        onSuccess();
      },
      onError(e) {
        alert(`Error updating job: ${e.message}`);
      },
    }),
  );

  if (!editing) {
    return (
      <button
        type="button"
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
        onClick={() => {
          setTitle(job.title);
          setDescription(job.description);
          setEditing(true);
        }}
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Title"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Description"
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
          disabled={updateMutation.isPending}
          onClick={() => {
            if (!title.trim() || !description.trim()) {
              alert("Title and description are required.");
              return;
            }
            updateMutation.mutate({
              id: job.id,
              title: title.trim(),
              description: description.trim(),
            });
          }}
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded hover:bg-gray-100 text-sm cursor-pointer"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// -- Delete action --

function DeleteAction({
  jobId,
  onSuccess,
}: {
  jobId: number;
  onSuccess: () => void;
}) {
  const deleteMutation = useMutation(
    trpc.jobs.remove.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error deleting job: ${e.message}`);
      },
    }),
  );

  return (
    <button
      type="button"
      className="px-3 py-1 rounded bg-red-400 text-white hover:opacity-90 text-sm cursor-pointer"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this job?")) {
          deleteMutation.mutate(jobId);
        }
      }}
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
