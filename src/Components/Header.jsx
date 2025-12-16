const Header = () => {
  return (
    // Outer container maintains original gradient and sticky behavior
    <div className="sticky top-0 z-40 w-full"> 
      
      {/* Background Gradient Layer - Must be on the sticky container to ensure the colors move with the blur effect */}
      <div className="bg-gradient-to-r from-sky-200 via-sky-300 to-blue-400">
        {/* TEXTURE LAYER (Subtle pattern for visual depth) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 // Custom repeating gradient for a subtle diagonal line/dot effect
                 backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 50px)'
             }}
        ></div>

        {/* Header Content Layer: Transparent background + heavy blur for the Frosted Glass look */}
        <header className="relative bg-sky-50/20 backdrop-blur-xl flex items-center justify-between px-8 py-3 shadow-xl border-b border-white/70">
          
          {/* Branding area with icon and hover effect */}
          <div className="flex items-center space-x-3 transition transform hover:scale-[1.02] cursor-pointer duration-300">
            <span className="text-3xl" role="img" aria-label="Globe">
              🌍
          </span>
            <h1 className="font-extrabold text-2xl text-sky-900 tracking-tight">
              ExploreWorld
            </h1>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;