import type { Vehicle } from "@packages/database/vehicles";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";

import VehicleCard from "@/components/VehicleCard";
import { trpc } from "@/router";

export const Route = createFileRoute(
  "/_authenticated/dashboard/vehicles/$vehicleId",
)({
  beforeLoad: ({ context }) => {
    if (!context.permissions.includes("GET:vehicle")) {
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
  const { vehicleId } = Route.useParams();
  const { permissions, session } = Route.useRouteContext();
  const router = useRouter();
  const vehicleIdNum = Number(vehicleId);

  const canUpdate = permissions.includes("UPDATE:vehicle");
  const canDelete = permissions.includes("DELETE:vehicle");
  // checkout and return use GET:vehicle permission
  const canCheckout = permissions.includes("GET:vehicle");

  const vehicleQuery = useQuery(
    trpc.vehicles.getById.queryOptions(vehicleIdNum),
  );

  const { data: vehicle, isLoading, error } = vehicleQuery;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!vehicle) return <p>Vehicle not found.</p>;

  return (
    <div>
      <Link
        to="/dashboard/vehicles"
        className="text-blue-500 hover:underline text-sm mb-3 inline-block"
      >
        &larr; Back to Vehicles
      </Link>

      <VehicleCard
        vehicle={vehicle}
        actions={
          <>
            {canCheckout && (
              <CheckoutReturnActions
                vehicle={vehicle}
                currentUserId={session.user.id}
                onSuccess={() => vehicleQuery.refetch()}
              />
            )}
            {canUpdate && (
              <EditAction
                vehicle={vehicle}
                onSuccess={() => vehicleQuery.refetch()}
              />
            )}
            {canDelete && (
              <DeleteAction
                vehicleId={vehicle.id}
                onSuccess={async () => {
                  await router.navigate({ to: "/dashboard/vehicles" });
                }}
              />
            )}
          </>
        }
      />
    </div>
  );
}

// -- Checkout / Return actions --

function CheckoutReturnActions({
  vehicle,
  currentUserId,
  onSuccess,
}: {
  vehicle: Vehicle;
  currentUserId: number;
  onSuccess: () => void;
}) {
  const checkoutMutation = useMutation(
    trpc.vehicles.checkout.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error checking out vehicle: ${e.message}`);
      },
    }),
  );

  const returnMutation = useMutation(
    trpc.vehicles.return.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error returning vehicle: ${e.message}`);
      },
    }),
  );

  if (vehicle.status === "maintenance") {
    return (
      <span className="text-sm text-gray-400 italic">
        Vehicle is under maintenance
      </span>
    );
  }

  if (vehicle.checkedOutBy != null) {
    return (
      <button
        type="button"
        className="px-3 py-1 rounded bg-yellow-400 hover:opacity-90 text-sm cursor-pointer"
        disabled={returnMutation.isPending}
        onClick={() => returnMutation.mutate(vehicle.id)}
      >
        {returnMutation.isPending ? "Returning..." : "Return Vehicle"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
      disabled={checkoutMutation.isPending}
      onClick={() =>
        checkoutMutation.mutate({
          vehicleId: vehicle.id,
          userId: currentUserId,
        })}
    >
      {checkoutMutation.isPending ? "Checking out..." : "Checkout"}
    </button>
  );
}

// -- Edit action --

function EditAction({
  vehicle,
  onSuccess,
}: {
  vehicle: Vehicle;
  onSuccess: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [vin, setVin] = useState(vehicle.vin);
  const [status, setStatus] = useState(vehicle.status);

  const updateMutation = useMutation(
    trpc.vehicles.update.mutationOptions({
      onSuccess: () => {
        setEditing(false);
        onSuccess();
      },
      onError(e) {
        alert(`Error updating vehicle: ${e.message}`);
      },
    }),
  );

  if (!editing) {
    return (
      <button
        type="button"
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
        onClick={() => {
          setMake(vehicle.make);
          setModel(vehicle.model);
          setYear(String(vehicle.year));
          setVin(vehicle.vin);
          setStatus(vehicle.status);
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
        value={make}
        onChange={(e) => setMake(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Make"
      />
      <input
        type="text"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Model"
      />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Year"
      />
      <input
        type="text"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="VIN"
      />
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as Vehicle["status"])}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="available">Available</option>
        <option value="in_use">In Use</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-400 text-white hover:opacity-90 text-sm cursor-pointer"
          disabled={updateMutation.isPending}
          onClick={() => {
            if (!make.trim() || !model.trim() || !year.trim() || !vin.trim()) {
              alert("All fields are required.");
              return;
            }
            const yearNum = Number(year);
            if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
              alert("Enter a valid year.");
              return;
            }
            updateMutation.mutate({
              id: vehicle.id,
              make: make.trim(),
              model: model.trim(),
              year: yearNum,
              vin: vin.trim(),
              status,
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
  vehicleId,
  onSuccess,
}: {
  vehicleId: number;
  onSuccess: () => void;
}) {
  const deleteMutation = useMutation(
    trpc.vehicles.remove.mutationOptions({
      onSuccess,
      onError(e) {
        alert(`Error deleting vehicle: ${e.message}`);
      },
    }),
  );

  return (
    <button
      type="button"
      className="px-3 py-1 rounded bg-red-400 text-white hover:opacity-90 text-sm cursor-pointer"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this vehicle?")) {
          deleteMutation.mutate(vehicleId);
        }
      }}
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
