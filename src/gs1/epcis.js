// Costruzione di un EPCISDocument 2.0 a partire da una lista di eventi.
export const EPCIS_CONTEXT = "https://ref.gs1.org/standards/epcis/epcis-context.jsonld";

export function toDocument(events, creationDate = events[events.length - 1].eventTime) {
  return {
    "@context": [EPCIS_CONTEXT],
    type: "EPCISDocument",
    schemaVersion: "2.0",
    creationDate,
    epcisBody: { eventList: events }
  };
}
