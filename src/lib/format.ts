import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export function formatCategory(inp: number) {
	if (inp === 0) return { name: 'Videospiele', icon: 'ph:game-controller' };
	if (inp === 1) return { name: 'Gesellschaftsspiele', icon: 'bxs:chess' };
	if (inp === 2) return { name: 'Bücher', icon: 'ph:books' };
	if (inp === 3) return { name: 'Sommerkleidung', icon: 'ph:t-shirt' };
	if (inp === 4) return { name: 'Winterkleidung', icon: 'game-icons:winter-gloves' };
	if (inp === 5) return { name: 'Sportsachen', icon: 'material-symbols:sports-football-outline-rounded' };
	if (inp === 6) return { name: 'Schulsachen', icon: 'map:school' };
	if (inp === 7) return { name: 'Elektronik', icon: 'ic:twotone-smartphone' };
	return { name: 'Sonstiges', icon: 'mdi:dots-horizontal-circle-outline' };
}

export function formatPrice(inp: number | null) {
	if (!inp) return '00,00 €';

	const euros = Math.floor(inp / 100);
	const cents = inp - euros * 100;
	return `${euros},${cents.toString().padEnd(2, '0')} €`;
}

export function formatPriceFixed(inp: boolean | null) {
	if (inp === null) return 'Kostenlos';
	if (inp) return 'Festpreis';
	return 'Verhandlung';
}

export function formatReport(inp: number) {
	if (inp === 0) return 'Spam';
	if (inp === 1) return 'Beleidigung';
	if (inp === 2) return 'Diskriminierung';
	return 'Verletzung der Privatsphäre';
}

const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function formatTime(inp: string) {
	const time = new Date(inp);
	const minute = time.getMinutes();
	const hour = time.getHours();
	const day = days[time.getDay()];
	const date = time.getDate();
	const month = months[time.getMonth()];
	const year = time.getFullYear();
	const diffDays = new Date().getDate() - date;
	const diffMonths = new Date().getMonth() - time.getMonth();
	const diffYears = new Date().getFullYear() - time.getFullYear();

	if (diffYears === 0 && diffMonths === 0 && diffDays === 0) {
		return `Heute, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	} else if (diffYears === 0 && diffMonths === 0 && diffDays === 1) {
		return `Gestern, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	} else if (diffYears === 0 && diffMonths === 0 && diffDays === 2) {
		return `Vorgestern, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	} else if (diffYears === 0) {
		return `${day}. ${date}. ${month}.`;
	} else {
		return `${date}. ${month}. ${year}`;
	}
}

export function formatReportTime(inp: number) {
	const time = new Date(inp);
	const minute = time.getMinutes();
	const hour = time.getHours();
	const day = days[time.getDay()];
	const date = time.getDate();
	const month = months[time.getMonth()];
	const year = time.getFullYear();
	const diffYears = new Date().getFullYear() - time.getFullYear();

	if (diffYears === 0) {
		return `${day}. ${date}. ${month}., ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	} else {
		return `${date}. ${month}. ${year}`;
	}
}

export function formatReportTimeType(inp1: number, inp2: number) {
	if (inp1 === 0 && inp2 === 1) return 'Stunde';
	if (inp1 === 0) return 'Stunden';
	if (inp1 === 1 && inp2 === 1) return 'Tag';
	if (inp1 === 1) return 'Tage';
	if (inp1 === 2 && inp2 === 1) return 'Woche';
	if (inp1 === 2) return 'Wochen';
	if (inp1 === 3 && inp2 === 1) return 'Monat';
	if (inp1 === 3) return 'Monate';
	return 'Dauerhaft';
}

export function formatImage(inp: string, bucketId: string) {
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketId}/${inp}`;
}
