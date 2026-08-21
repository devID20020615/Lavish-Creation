import React from 'react';
import { JaapiMotif } from './JaapiMotif';

interface DividerProps {
  variant?: 'gamosa' | 'bamboo' | 'jaapi' | 'floral';
  labelAs?: string;
  labelEn?: string;
  isAssamese?: boolean;
}

export const GamosaDivider: React.FC<DividerProps> = ({
  variant = 'gamosa',
  labelAs,
  labelEn,
  isAssamese = false,
}) => {
  const labelText = isAssamese ? labelAs : labelEn;

  return (
    <div className="w-full flex items-center justify-center my-10 md:my-16 select-none px-4">
      <div className="flex items-center justify-center w-full max-w-3xl gap-3 sm:gap-4">
        {/* Left Gold/Red Weave Line */}
        <div className="flex-1 flex items-center">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#B68C4A]/50 to-[#8C1D18]" />
          <div className="w-2 h-2 rotate-45 border border-[#8C1D18] bg-[#FAF8F5] -ml-1 shrink-0" />
        </div>

        {/* Center Content - Perfectly Symmetrical */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-2 shrink-0 text-center">
          {labelText ? (
            /* Symmetrical Label Wrapper */
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Left Accent Ornament */}
              <div className="flex items-center gap-1 text-[#B68C4A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B68C4A]/60" />
                <span className="text-[10px]">❖</span>
              </div>

              {/* Label Text */}
              <span
                className={`text-xs sm:text-sm tracking-widest uppercase font-semibold text-[#8C1D18] font-serif-playfair ${
                  isAssamese ? 'font-assamese font-bold text-sm sm:text-base tracking-normal' : ''
                }`}
              >
                {labelText}
              </span>

              {/* Right Accent Ornament */}
              <div className="flex items-center gap-1 text-[#B68C4A]">
                <span className="text-[10px]">❖</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B68C4A]/60" />
              </div>
            </div>
          ) : (
            /* Variant Standalone Motifs (No Label) */
            <>
              {variant === 'jaapi' && (
                <JaapiMotif size={28} className="text-[#B68C4A]" />
              )}

              {variant === 'gamosa' && (
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#D8C2A3]/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C1D18]" />
                  <span className="w-1 h-1 rounded-full bg-[#D4B16A]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C1D18]" />
                </div>
              )}

              {variant === 'bamboo' && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[2px] rounded-full bg-[#D8C2A3]" />
                  <div className="w-2.5 h-2.5 rounded-full border border-[#B68C4A] bg-[#FAF8F5] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#8C1D18]" />
                  </div>
                  <div className="w-6 h-[2px] rounded-full bg-[#D8C2A3]" />
                </div>
              )}

              {variant === 'floral' && (
                <div className="flex items-center gap-2 text-[#8C1D18]">
                  <span className="text-xs">❀</span>
                  <span className="text-sm font-serif-playfair tracking-widest text-[#B68C4A]">❖</span>
                  <span className="text-xs">❀</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Gold/Red Weave Line */}
        <div className="flex-1 flex items-center">
          <div className="w-2 h-2 rotate-45 border border-[#8C1D18] bg-[#FAF8F5] -mr-1 shrink-0" />
          <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#B68C4A]/50 to-[#8C1D18]" />
        </div>
      </div>
    </div>
  );
};
