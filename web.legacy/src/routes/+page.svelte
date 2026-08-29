<script lang="ts">
	import type { Ticket, TicketPriority, TicketStatus, CreateTicketPayload } from '$lib/types/ticket';

	// Svelte 5 state runes
	let tickets = $state<Ticket[]>([]);
	let loading = $state(false);
	let isModalOpen = $state(false);
	let searchQuery = $state('');
	let selectedPriorityFilter = $state<string>('all');

	// Form state
	let formProjectId = $state('00000000-0000-0000-0000-000000000001');
	let formCreatedBy = $state('00000000-0000-0000-0000-000000000002');
	let formIdentifier = $state('KIZ-101');
	let formTitle = $state('');
	let formDescription = $state('');
	let formPriority = $state<TicketPriority>('high');
	let formSubmitting = $state(false);

	// Notification toast state
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	function showToast(type: 'success' | 'error', message: string) {
		toast = { type, message };
		setTimeout(() => {
			toast = null;
		}, 4000);
	}

	function incrementIdentifier() {
		const match = formIdentifier.match(/^(.*?)(\d+)$/);
		if (match) {
			const prefix = match[1];
			const num = parseInt(match[2], 10) + 1;
			formIdentifier = `${prefix}${num}`;
		} else {
			formIdentifier = `${formIdentifier}-1`;
		}
	}

	async function handleCreateTicket(e: SubmitEvent) {
		e.preventDefault();
		if (!formTitle.trim() || !formIdentifier.trim()) return;

		formSubmitting = true;

		const payload: CreateTicketPayload = {
			project_id: formProjectId,
			created_by: formCreatedBy,
			identifier: formIdentifier.trim(),
			title: formTitle.trim(),
			description: formDescription.trim(),
			priority: formPriority
		};

		try {
			const res = await fetch('/api/tickets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (!res.ok) {
				showToast('error', data.error || data.message || 'Failed to create ticket');
				return;
			}

			// Add created ticket to board state
			tickets = [data, ...tickets];
			showToast('success', `Ticket ${data.Identifier || data.identifier} created successfully!`);

			// Reset form & increment identifier
			formTitle = '';
			formDescription = '';
			incrementIdentifier();
			isModalOpen = false;
		} catch (err: any) {
			showToast('error', err.message || 'Network error creating ticket');
		} finally {
			formSubmitting = false;
		}
	}

	// Derived filtered tickets
	let filteredTickets = $derived(
		tickets.filter((t) => {
			const matchesSearch =
				(t.Title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(t.Identifier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(t.Description || '').toLowerCase().includes(searchQuery.toLowerCase());

			const matchesPriority =
				selectedPriorityFilter === 'all' || (t.Priority || '').toLowerCase() === selectedPriorityFilter;

			return matchesSearch && matchesPriority;
		})
	);

	// Columns definition
	const columns: { id: TicketStatus; label: string; color: string }[] = [
		{ id: 'backlog', label: 'Backlog', color: 'border-slate-500/30 text-slate-400' },
		{ id: 'in_progress', label: 'In Progress', color: 'border-amber-500/30 text-amber-400' },
		{ id: 'in_review', label: 'In Review', color: 'border-indigo-500/30 text-indigo-400' },
		{ id: 'done', label: 'Done', color: 'border-emerald-500/30 text-emerald-400' }
	];

	function getPriorityBadgeClass(priority: string) {
		switch ((priority || '').toLowerCase()) {
			case 'critical':
				return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
			case 'high':
				return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
			case 'medium':
				return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
			case 'low':
				return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
			default:
				return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
		}
	}
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
	<!-- Toast Notification -->
	{#if toast}
		<div
			class="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium flex items-center gap-2 transition-all duration-300 {toast.type ===
			'success'
				? 'bg-slate-900 text-emerald-400 border-emerald-500/40'
				: 'bg-slate-900 text-rose-400 border-rose-500/40'}"
		>
			{#if toast.type === 'success'}
				<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
			{:else}
				<svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
			{/if}
			<span>{toast.message}</span>
		</div>
	{/if}

	<!-- Top Navigation -->
	<header class="bg-slate-900/80 backdrop-blur border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4">
		<div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
					K
				</div>
				<div>
					<h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
						Kizen Kanban Board
						<span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">
							v1.0
						</span>
					</h1>
					<p class="text-xs text-slate-400">Production Issue Tracker & Task Management</p>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<button
					onclick={() => (isModalOpen = true)}
					class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
					New Ticket
				</button>
			</div>
		</div>
	</header>

	<!-- Filter Controls & Board Header -->
	<div class="bg-slate-900/40 border-b border-slate-800/60 px-6 py-3">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-3 w-full sm:w-auto">
				<!-- Search -->
				<div class="relative w-full sm:w-64">
					<svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search tickets..."
						class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
					/>
				</div>

				<!-- Priority Filter -->
				<select
					bind:value={selectedPriorityFilter}
					class="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
				>
					<option value="all">All Priorities</option>
					<option value="critical">Critical</option>
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</select>
			</div>

			<!-- Quick Metrics -->
			<div class="flex items-center gap-4 text-xs text-slate-400 w-full sm:w-auto justify-end">
				<span>Total Tickets: <strong class="text-slate-200 font-semibold">{tickets.length}</strong></span>
				<span>Filtered: <strong class="text-slate-200 font-semibold">{filteredTickets.length}</strong></span>
			</div>
		</div>
	</div>

	<!-- Kanban Board Grid -->
	<main class="flex-1 max-w-7xl w-full mx-auto p-6 overflow-x-auto">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[800px] h-full">
			{#each columns as col}
				{@const colTickets = filteredTickets.filter(
					(t) => (t.Status || 'backlog').toLowerCase() === col.id
				)}
				<div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-full min-h-[500px]">
					<!-- Column Header -->
					<div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full border {col.color}"></span>
							<h3 class="font-semibold text-sm text-slate-200">{col.label}</h3>
						</div>
						<span class="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-400">
							{colTickets.length}
						</span>
					</div>

					<!-- Tickets Container -->
					<div class="flex-1 space-y-3 overflow-y-auto">
						{#each colTickets as ticket}
							<div class="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl p-4 shadow-md transition group cursor-pointer">
								<div class="flex items-center justify-between mb-2">
									<span class="font-mono text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
										{ticket.Identifier || ticket.identifier}
									</span>
									<span class="px-2 py-0.5 rounded text-[10px] font-semibold border capitalize {getPriorityBadgeClass(ticket.Priority || ticket.priority)}">
										{ticket.Priority || ticket.priority}
									</span>
								</div>

								<h4 class="text-sm font-medium text-slate-100 mb-1 leading-snug">
									{ticket.Title || ticket.title}
								</h4>

								{#if ticket.Description || ticket.description}
									<p class="text-xs text-slate-400 line-clamp-2 mb-3">
										{ticket.Description || ticket.description}
									</p>
								{/if}

								<div class="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
									<span>Backlog</span>
									<div class="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold text-[9px] flex items-center justify-center border border-indigo-700/50">
										US
									</div>
								</div>
							</div>
						{:else}
							<div class="h-32 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-xs text-slate-600">
								No tickets
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</main>

	<!-- Create Ticket Modal -->
	{#if isModalOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
			<div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden">
				<div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
					<h3 class="text-lg font-bold text-white">Create New Ticket</h3>
					<button
						onclick={() => (isModalOpen = false)}
						class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
					</button>
				</div>

				<form onsubmit={handleCreateTicket} class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="modal-id" class="block text-xs font-medium text-slate-400 mb-1">Identifier</label>
							<input
								id="modal-id"
								type="text"
								bind:value={formIdentifier}
								required
								class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
							/>
						</div>
						<div>
							<label for="modal-priority" class="block text-xs font-medium text-slate-400 mb-1">Priority</label>
							<select
								id="modal-priority"
								bind:value={formPriority}
								class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="critical">Critical</option>
							</select>
						</div>
					</div>

					<div>
						<label for="modal-title" class="block text-xs font-medium text-slate-400 mb-1">Title</label>
						<input
							id="modal-title"
							type="text"
							bind:value={formTitle}
							required
							placeholder="Summary of issue or task..."
							class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
						/>
					</div>

					<div>
						<label for="modal-desc" class="block text-xs font-medium text-slate-400 mb-1">Description</label>
						<textarea
							id="modal-desc"
							bind:value={formDescription}
							rows="3"
							placeholder="Detailed explanation..."
							class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
						></textarea>
					</div>

					<div class="pt-4 border-t border-slate-800 flex justify-end gap-3">
						<button
							type="button"
							onclick={() => (isModalOpen = false)}
							class="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={formSubmitting}
							class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-2"
						>
							{#if formSubmitting}
								<span>Creating...</span>
							{:else}
								<span>Create Ticket</span>
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
