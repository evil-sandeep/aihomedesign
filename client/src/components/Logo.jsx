const Logo = ({ className = "w-10 h-10" }) => {
    return (
        <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background Circle */}
            <circle cx="60" cy="60" r="55" fill="#0f172a"/>

            {/* House Shape */}
            <path d="M30 60 L60 30 L90 60 V90 H30 Z" fill="#38bdf8"/>

            {/* Door */}
            <rect x="52" y="70" width="16" height="20" fill="#0f172a"/>

            {/* AI Circuit Lines */}
            <circle cx="60" cy="20" r="5" fill="#22c55e"/>
            <line x1="60" y1="25" x2="60" y2="35" stroke="#22c55e" stroke-width="2"/>

            <circle cx="25" cy="50" r="4" fill="#22c55e"/>
            <line x1="29" y1="50" x2="40" y2="55" stroke="#22c55e" stroke-width="2"/>

            <circle cx="95" cy="50" r="4" fill="#22c55e"/>
            <line x1="91" y1="50" x2="80" y2="55" stroke="#22c55e" stroke-width="2"/>

            {/* Window */}
            <rect x="45" y="60" width="10" height="10" fill="#0f172a"/>
            <rect x="65" y="60" width="10" height="10" fill="#0f172a"/>
        </svg>
    );
};

export default Logo;
