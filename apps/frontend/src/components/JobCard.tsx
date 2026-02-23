import type { Job } from "@packages/database/jobs";

const STATUS_LABELS: Record<Job["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface JobCardProps {
  job: Job;
  actions?: React.ReactNode;
}

function JobCard({ job, actions }: JobCardProps) {
  return (
    <div className="border border-gray-200 rounded p-4 max-w-lg">
      <div className="mb-3">
        <h2 className="text-xl font-semibold">{job.title}</h2>
        <p className="text-gray-600 mt-1">{job.description}</p>
      </div>

      <div className="text-sm space-y-1 mb-3">
        <p>
          <span className="font-medium">Status:</span>{" "}
          <span className="inline-block px-2 py-0.5 rounded bg-gray-100">
            {STATUS_LABELS[job.status]}
          </span>
        </p>
        <p>
          <span className="font-medium">Assigned to:</span>{" "}
          {job.assignedTo != null ? `User #${job.assignedTo}` : "Unassigned"}
        </p>
        <p>
          <span className="font-medium">Created by:</span> User #{job.createdBy}
        </p>
        <p>
          <span className="font-medium">Created:</span>{" "}
          {new Date(job.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Updated:</span>{" "}
          {new Date(job.updatedAt).toLocaleString()}
        </p>
      </div>

      {actions && <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">{actions}</div>}
    </div>
  );
}

export default JobCard;
