import type { WritableAlerts } from '../routes/Alerts.svelte';

export default async function appendImages(
	event: Event & { currentTarget: EventTarget & HTMLInputElement },
	images: (string | Blob)[],
	alerts: WritableAlerts,
	imageLimit: number
) {
	const inputElement = event.currentTarget;

	if (!inputElement.files) return;
	const files = Array.from(inputElement.files);
	if (files.length === 0) return;
	inputElement.value = '';

	if (images.length + files.length > imageLimit) {
		const alertId = Symbol();
		alerts.update((oldAlerts) => [
			...oldAlerts,
			{
				id: alertId,
				color: 'red',
				icon: 'material-symbols:info-outline-rounded',
				title: `Maximal ${imageLimit} Bilder`,
				description: `Die ersten ${imageLimit} Bilder wurden gewählt`
			}
		]);

		files.splice(imageLimit - images.length);
	}

	const processedImages: Blob[] = [];

	const reader = new FileReader();
	for (let i = files.length - 1; i >= 0; i--) {
		// Iterate backwards to enable splicing while iterating
		if (!files[i].type.startsWith('image/')) files.splice(i, 1);

		reader.readAsArrayBuffer(files[i]);

		await new Promise<void>((resolve) => {
			reader.onload = (event) => {
				const image = new Image();
				if (!event.target?.result) {
					resolve();
					return;
				}
				image.src = window.URL.createObjectURL(new Blob([event.target.result]));

				image.onload = () => {
					const canvas = document.createElement('canvas');

					let width = image.width;
					let height = image.height;

					if (width > 600) {
						height = Math.round(height * (600 / width));
						width = 600;
					}
					if (height > 450) {
						width = Math.round(width * (450 / height));
						height = 450;
					}

					canvas.width = width;
					canvas.height = height;
					const context = canvas.getContext('2d');
					if (!context) {
						resolve();
						return;
					}
					context.drawImage(image, 0, 0, width, height);

					canvas.toBlob(
						(blob) => {
							if (!blob) {
								resolve();
								return;
							}
							processedImages.unshift(blob);
							resolve();
						},
						'image/jpeg',
						0.5
					);
				};
			};
		});
	}

	return images.concat(processedImages);
}
