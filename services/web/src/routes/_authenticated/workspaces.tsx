import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { workspaceQueries } from '#/lib/queries/workspaces'

export const Route = createFileRoute('/_authenticated/workspaces')({
  component: WorkspacesPage,
})

function WorkspacesPage() {
  const { data: workspaces, isPending, isError, error } = useQuery(
    workspaceQueries.list()
  )

  if (isPending) return <p className="p-4">Loading workspaces from Go API…</p>
  if (isError) return <p className="p-4 text-red-500">Error: {String(error)}</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>

      {!workspaces || workspaces.length === 0 ? (
        <p className="text-gray-500">No workspaces found. Create one to get started.</p>
      ) : (
        <ul className="space-y-2">
          {workspaces.map((ws) => (
            <li key={ws.id} className="p-4 border rounded shadow-sm">
              <h2 className="font-semibold">{ws.name}</h2>
              <span className="text-xs text-gray-400">Slug: {ws.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
