declare global {
  interface Window {
    daum: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeResult) => void; width?: string; height?: string }) => { embed: (element: HTMLElement) => void };
    };
  }
}

interface DaumPostcodeResult {
  address: string;
  zonecode: string;
}

export const useAddressSearch = (onSelect: (address: string, zonecode: string) => void) => {
  const embedPostcode = (element: HTMLElement) => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        onSelect(data.address, data.zonecode);
      },
      width: '100%',
      height: '100%',
    }).embed(element);
  };

  return { embedPostcode };
};