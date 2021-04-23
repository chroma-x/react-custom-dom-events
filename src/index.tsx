import { MutableRefObject, RefObject, useEffect } from 'react';

export interface TypedCustomDomEvent<T> extends CustomEvent {
	detail: T;
}

function isRef(element: any): element is RefObject<HTMLElement> | MutableRefObject<HTMLElement> {
	const current = element.current ?? null;
	return current instanceof HTMLElement;
}

function unwrapDomElement(element: HTMLElement | RefObject<HTMLElement> | MutableRefObject<HTMLElement>): HTMLElement | null {
	return isRef(element) ? element.current : element;
}

export function useCustomDomEventListener<T = any>(
	listenerTarget: HTMLElement | RefObject<HTMLElement> | MutableRefObject<HTMLElement>,
	event: string,
	eventHandler: (event: TypedCustomDomEvent<T>) => void,
	options?: AddEventListenerOptions
): () => void {
	// Prepare the handler
	const handleEvent = (customEvent: CustomEvent | Event) => {
		eventHandler(customEvent as TypedCustomDomEvent<T>);
	};

	// Prepare the listener options
	const listenerOptions: AddEventListenerOptions | false = options ?? false;

	// Invoke useEffect to async add the listener
	useEffect(() => {
		const listenerTargetElement = unwrapDomElement(listenerTarget);
		if (listenerTargetElement === null) {
			return;
		}

		listenerTargetElement.addEventListener(event, handleEvent, listenerOptions);

		// eslint-disable-next-line consistent-return
		return () => {
			listenerTargetElement.removeEventListener(event, handleEvent, listenerOptions);
		};
	});

	// Return the listener removal closure
	return () => {
		const listenerTargetElement = unwrapDomElement(listenerTarget);
		if (listenerTargetElement === null) {
			return;
		}
		listenerTargetElement.removeEventListener(event, handleEvent, listenerOptions);
	};
}

export function emitCustomDomEvent<T = any>(
	eventTarget: HTMLElement | RefObject<HTMLElement> | MutableRefObject<HTMLElement>,
	event: string,
	payload?: T,
	options?: EventInit
): void {
	const eventTargetElement = unwrapDomElement(eventTarget);
	if (eventTargetElement === null) {
		return;
	}

	const eventInit = (options ?? {}) as CustomEventInit;
	eventInit.detail = payload ?? null;
	eventTargetElement.dispatchEvent(new CustomEvent(event, eventInit));
}
