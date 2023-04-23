export const formatCategory = (inp: number) => {
	if (inp === 0) return { name: 'Videospiele', icon: 'ph:game-controller' };
	if (inp === 1) return { name: 'Gesellschaftsspiele', icon: 'bxs:chess' };
	if (inp === 2) return { name: 'Bücher', icon: 'ph:books' };
	if (inp === 3) return { name: 'Sommerkleidung', icon: 'ph:t-shirt' };
	if (inp === 4) return { name: 'Winterkleidung', icon: 'game-icons:winter-gloves' };
	if (inp === 5) return { name: 'Sportsachen', icon: 'material-symbols:sports-football-outline-rounded' };
	if (inp === 6) return { name: 'Schulsachen', icon: 'map:school' };
	if (inp === 7) return { name: 'Elektronik', icon: 'ic:twotone-smartphone' };
	return { name: 'Sonstiges', icon: 'mdi:dots-horizontal-circle-outline' };
};

export const formatPrice = (inp: number | null) => {
	if (!inp) return '00,00 €';

	return `${inp.toString().replace('.', ',')} €`;
};

export const formatPriceType = (inp: boolean | null) => {
	if (inp === null) return 'Kostenlos';
	if (inp) return 'Verhandlung';
	return 'Festpreis';
};

export const formatReport = (inp: number) => {
	if (inp === 0) return 'Spam';
	if (inp === 1) return 'Beleidigung';
	if (inp === 2) return 'Diskriminierung';
	return 'Verletzung der Privatsphäre';
};

const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const formatTime = (inp: Date) => {
	const minute = inp.getMinutes();
	const hour = inp.getHours();
	const day = days[inp.getDay()];
	const date = inp.getDate();
	const month = months[inp.getMonth()];
	const year = inp.getFullYear();
	const diffDays = new Date().getDate() - date;
	const diffMonths = new Date().getMonth() - inp.getMonth();
	const diffYears = new Date().getFullYear() - inp.getFullYear();

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
};

export const formatReportTimeType = (inp1: number, inp2: number) => {
	if (inp1 === 0 && inp2 === 1) return 'Stunde';
	if (inp1 === 0) return 'Stunden';
	if (inp1 === 1 && inp2 === 1) return 'Tag';
	if (inp1 === 1) return 'Tage';
	if (inp1 === 2 && inp2 === 1) return 'Woche';
	if (inp1 === 2) return 'Wochen';
	if (inp1 === 3 && inp2 === 1) return 'Monat';
	if (inp1 === 3) return 'Monate';
	return 'Dauerhaft';
};

//   export const formatImage = (inp: string) => {
//     return `${useRuntimeConfig().public.supabase.url}/storage/v1/object/public/offer-images/${inp}`;
//   };
