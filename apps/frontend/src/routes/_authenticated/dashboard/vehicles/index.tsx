import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import VehiclesList from "@/components/VehiclesList";
import { trpc } from "@/router";

export const Route = createFileRoute(
  "/_authenticated/dashboard/vehicles/",
)({
  beforeLoad: ({ context }) => {
    if (!context.permissions.includes("LIST:vehicles")) {
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
  const { permissions, userData } = Route.useRouteContext();

  const canCreate = permissions.includes("CREATE:vehicle");

  const vehiclesQuery = useQuery({
    ...trpc.vehicles.list.queryOptions(),
    initialData: userData.vehicles ?? undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Vehicles</h2>
        {canCreate && (
          <CreateVehicleForm onCreated={() => vehiclesQuery.refetch()} />
        )}
      </div>

      {vehiclesQuery.isLoading && <p>Loading...</p>}
      {vehiclesQuery.error && (
        <p className="text-red-500">
          Error: {vehiclesQuery.error.message}
        </p>
      )}
      {vehiclesQuery.data && (
        <VehiclesList vehicles={vehiclesQuery.data} title="All Vehicles" />
      )}
    </div>
  );
}

function CreateVehicleForm({ onCreated }: { onCreated: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");

  const createMutation = useMutation(
    trpc.vehicles.create.mutationOptions({
      onSuccess: () => {
        setMake("");
        setModel("");
        setYear("");
        setVin("");
        setShowForm(false);
        onCreated();
      },
      onError(e) {
        alert(`Error creating vehicle: ${e.message}`);
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
        Create Vehicle
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded p-3">
      <h3 className="font-semibold mb-2">New Vehicle</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="VIN"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-blue-400 text-white rounded hover:opacity-90 cursor-pointer"
            onClick={() => {
              if (
                !make.trim() ||
                !model.trim() ||
                !year.trim() ||
                !vin.trim()
              ) {
                alert("All fields are required.");
                return;
              }
              const yearNum = Number(year);
              if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
                alert("Enter a valid year.");
                return;
              }
              createMutation.mutate({
                make: make.trim(),
                model: model.trim(),
                year: yearNum,
                vin: vin.trim(),
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
