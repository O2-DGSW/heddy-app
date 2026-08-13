import { useEffect, useRef } from "react";
import { lightTheme, font } from "@heddy/design-tokens";

interface AddressSearchModalProps {
  onClose: () => void;
  embedPostcode: (element: HTMLElement) => void;
}

export const AddressSearchModal = ({ onClose, embedPostcode }: AddressSearchModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      embedPostcode(containerRef.current);
    }
  }, [embedPostcode]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="flex flex-col bg-white flex-1 mx-4 my-16 rounded-2xl overflow-hidden">
        <div
          className={`flex items-center justify-between px-4 py-3 ${font.body.bold}`}
          style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
        >
          <span style={{ color: lightTheme.label.normal }}>주소 검색</span>
          <button
            className={font.body.medium}
            style={{ color: lightTheme.label.assistive }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
};
