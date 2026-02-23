import type { Vehicle } from "@packages/database/vehicles";
import { Link } from "@tanstack/react-router";

const STATUS_LABELS: Record<Vehicle["status"], string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
};

interface VehiclesListProps {
  vehicles: Array<Vehicle>;
  title?: string;
}

function VehiclesList({ vehicles, title = "Vehicles" }: VehiclesListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to="/dashboard/vehicles/$vehicleId"
              params={{ vehicleId: String(vehicle.id) }}
              className="block border border-gray-200 rounded p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </span>
                  <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                </div>
                <div className="text-right text-sm">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {STATUS_LABELS[vehicle.status]}
                  </span>
                  {vehicle.checkedOutBy != null && (
                    <p className="text-gray-500 mt-1">
                      Checked out by: #{vehicle.checkedOutBy}
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

export default VehiclesList;
