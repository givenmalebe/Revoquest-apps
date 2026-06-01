import { MessageCircle } from "lucide-react";

const WhatsAppChat = () => {
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send/?phone=27696831929&text=Hi+%2ARevoQuest+Training+Institute%2A%21+I+need+more+info+about+RevoQuest+Training+Institute+https%3A%2F%2Fwww.revoquest.co.za%2F&type=phone_number&app_absent=0', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleWhatsAppClick}
        className="group relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
        
        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></div>
      </button>
    </div>
  );
};

export default WhatsAppChat;
