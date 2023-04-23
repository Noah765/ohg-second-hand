<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	onMount(() => {
		// const client = new RealtimeClient('wss://ftrdgtijjocjucsewfjj.supabase.co/realtime/v1', {
		// 	params: {
		// 		apikey:
		// 			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cmRndGlqam9janVjc2V3ZmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3OTgzODA2MywiZXhwIjoxOTk1NDE0MDYzfQ.JENmV9-2eaTEOpG_5mTDZiHMkDIC_X_UPkSQgFVkguY',
		// 		eventsPerSecond: 10
		// 	}
		// });
		// const channel = client.channel('db-changes');
		// channel.on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
		// 	console.log('All changes in public schema: ', payload);
		// });
		// channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
		// 	console.log('All inserts in messages table: ', payload);
		// });
		// channel.subscribe(async (status) => {
		// 	if (status === 'SUBSCRIBED') {
		// 		console.log('Ready to receive database changes!');
		// 	}
		// 	console.log(status);
		// });
	});
</script>

<section>
	<h3>Supabase realtime test section</h3>

	<form method="POST" use:enhance>
		<button>Insert message</button>
	</form>
</section>
