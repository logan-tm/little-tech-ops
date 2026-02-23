import type { Job } from "@packages/database/jobs";
import { Link } from "@tanstack/react-router";

const STATUS_LABELS: Record<Job["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface JobsListProps {
  jobs: Array<Job>;
  title?: string;
}

function JobsList({ jobs, title = "Jobs" }: JobsListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to="/dashboard/jobs/$jobId"
              params={{ jobId: String(job.id) }}
              className="block border border-gray-200 rounded p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{job.title}</span>
                  <p className="text-sm text-gray-600">{job.description}</p>
                </div>
                <div className="text-right text-sm">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {STATUS_LABELS[job.status]}
                  </span>
                  {job.assignedTo != null && (
                    <p className="text-gray-500 mt-1">
                      Assigned to: #{job.assignedTo}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsList;
