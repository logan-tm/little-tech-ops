import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import JobsList from "@/components/JobsList";
import { trpc } from "@/router";

export const Route = createFileRoute("/_authenticated/dashboard/jobs/")({
  beforeLoad: ({ context }) => {
    if (
      !context.permissions.includes("LIST:jobs:assigned") &&
      !context.permissions.includes("LIST:jobs:all")
    ) {
      if (document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        throw redirect({
          to: "/",
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { permissions, session, userData } = Route.useRouteContext();

  const canListAll = permissions.includes("LIST:jobs:all");
  const canListAssigned = permissions.includes("LIST:jobs:assigned");
  const canCreate = permissions.includes("CREATE:job");

  const allJobsQuery = useQuery({
    ...trpc.jobs.list.queryOptions(),
    enabled: canListAll,
  });

  const assignedJobsQuery = useQuery({
    ...trpc.jobs.listAssigned.queryOptions(),
    enabled: canListAssigned,
    initialData: userData.assignedJobs ?? undefined,
  });

  const tabs: Array<"all" | "assigned"> = [];
  if (canListAll) tabs.push("all");
  if (canListAssigned) tabs.push("assigned");

  const [activeTab, setActiveTab] = useState<"all" | "assigned">(tabs[0]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Jobs</h2>
        {canCreate && (
          <CreateJobForm
            userId={session.user.id}
            onCreated={() => {
              allJobsQuery.refetch();
              assignedJobsQuery.refetch();
            }}
          />
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {canListAll && (
            <button
              type="button"
              className={`px-3 py-1.5 cursor-pointer ${activeTab === "all" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("all")}
            >
              All Jobs
            </button>
          )}
          {canListAssigned && (
            <button
              type="button"
              className={`px-3 py-1.5 cursor-pointer ${activeTab === "assigned" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("assigned")}
            >
              My Assigned Jobs
            </button>
          )}
        </div>
      )}

      {/* Tab content */}
      {activeTab === "all" && canListAll && (
        <div>
          {allJobsQuery.isLoading && <p>Loading...</p>}
          {allJobsQuery.error && (
            <p className="text-red-500">Error: {allJobsQuery.error.message}</p>
          )}
          {allJobsQuery.data && (
            <JobsList jobs={allJobsQuery.data} title="All Jobs" />
          )}
        </div>
      )}

      {activeTab === "assigned" && canListAssigned && (
        <div>
          {assignedJobsQuery.isLoading && <p>Loading...</p>}
          {assignedJobsQuery.error && (
            <p className="text-red-500">
              Error: {assignedJobsQuery.error.message}
            </p>
          )}
          {assignedJobsQuery.data && (
            <JobsList jobs={assignedJobsQuery.data} title="My Assigned Jobs" />
          )}
        </div>
      )}
    </div>
  );
}

function CreateJobForm({
  userId,
  onCreated,
}: {
  userId: number;
  onCreated: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation(
    trpc.jobs.create.mutationOptions({
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setShowForm(false);
        onCreated();
      },
      onError(e) {
        alert(`Error creating job: ${e.message}`);
      },
    }),
  );

  if (!showForm) {
    return (
      <button
        type="button"
        className="px-3 py-1.5 bg-blue-400 text-white rounded hover:opacity-90 cursor-pointer"
        onClick={() => setShowForm(true)}
      >
        Create Job
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded p-3">
      <h3 className="font-semibold mb-2">New Job</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-blue-400 text-white rounded hover:opacity-90 cursor-pointer"
            onClick={() => {
              if (!title.trim() || !description.trim()) {
                alert("Title and description are required.");
                return;
              }
              createMutation.mutate({
                title: title.trim(),
                description: description.trim(),
                createdBy: userId,
              });
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
