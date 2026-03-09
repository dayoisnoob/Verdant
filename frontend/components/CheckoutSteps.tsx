export function CheckoutSteps({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Delivery", "Payment", "Confirmation"];

  return (
    <div className="flex items-center gap-2 mt-5">
      {steps.map((step, i) => {
        const num = i + 1;
        const isDone = num < active;
        const isCurrent = num === active;

        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.58rem] font-bold flex-shrink-0 transition-colors ${
                  isCurrent
                    ? "bg-green text-white"
                    : isDone
                      ? "bg-green-light text-white"
                      : "bg-[#e8e8e8] text-[#aaa]"
                }`}
              >
                {isDone ? "✓" : num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline transition-colors ${
                  isCurrent
                    ? "text-green"
                    : isDone
                      ? "text-green-light"
                      : "text-[#bbb]"
                }`}
              >
                {step}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-6 md:w-10 h-px transition-colors ${isDone ? "bg-green-light" : "bg-[#e8e8e8]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
