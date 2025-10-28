interface StartScreenProps {
  onStart: () => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/bg1.png)' }}
    >
      <div className="text-center">
        <button
          onClick={onStart}
          className="px-24 py-3 bg-[#FFCD11] text-black text-4xl font-semibold  hover:shadow-xl transform hover:scale-105 transition-all duration-200 mr-[38rem]"
        >
         Start
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
