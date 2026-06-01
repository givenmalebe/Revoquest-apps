import { ChatProvider } from "@/contexts/ChatContext";
import { SmartLMS } from "@/components/SmartLMS";

const LMSPage = () => {
  return (
    <ChatProvider>
      <SmartLMS />
    </ChatProvider>
  );
};

export default LMSPage;
