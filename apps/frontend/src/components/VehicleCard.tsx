import type { Vehicle } from "@packages/database/vehicles";

const STATUS_LABELS: Record<Vehicle["status"], string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
};

interface VehicleCardProps {
  vehicle: Vehicle;
  actions?: React.ReactNode;
}

function VehicleCard({ vehicle, actions }: VehicleCardProps) {
  return (
    <div className="border border-gray-200 rounded p-4 max-w-lg">
      <div className="mb-3">
        <h2 className="text-xl font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <p className="text-gray-500 text-sm">VIN: {vehicle.vin}</p>
      </div>

      <div className="text-sm space-y-1 mb-3">
        <p>
          <span className="font-medium">Status:</span>{" "}
          <span className="inline-block px-2 py-0.5 rounded bg-gray-100">
            {STATUS_LABELS[vehicle.status]}
          </span>
        </p>
        <p>
          <span className="font-medium">Checked out by:</span>{" "}
          {vehicle.checkedOutBy != null
            ? `User #${vehicle.checkedOutBy}`
            : "Nobody"}
        </p>
        <p>
          <span className="font-medium">Created:</span>{" "}
          {new Date(vehicle.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Updated:</span>{" "}
          {new Date(vehicle.updatedAt).toLocaleString()}
        </p>
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
}

export default VehicleCard;
