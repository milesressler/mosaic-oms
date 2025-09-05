import ChatSidebar from "src/components/chat/ChatSidebar.tsx";

export function AsideContent() {
    return(
    <div style={{
        padding: '7px', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
    }}>
        <ChatSidebar isOpen={true} onClose={() => {}} embedded={true} />
    </div>);
}
export default AsideContent;
