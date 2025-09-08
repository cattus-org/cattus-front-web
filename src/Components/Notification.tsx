import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import StatusChange from './StatusChange';

type StatusType = 'critical' | 'attention' | 'healthy';

interface NotificationItem {
  id: string;
  catId: string;
  catName: string;
  catImageUrl: string;
  prevStatus?: StatusType;
  newStatus: StatusType;
  reason: string;
  date: string;
  time: string;
  isRead: boolean;
  type?: 'improvement' | 'decline' | 'same';
}

interface NotificationProps {
  token: string;
  company: string;
}

const Notification: React.FC<NotificationProps> = ({ token, company }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  function formatDateTime(timestamp: string): { date: string; time: string } {
    const dateObj = new Date(timestamp);

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    // Formatar
    const date = `${day}/${month}/${year}`;
    const time = `${hours}:${minutes}:${seconds}`;

    return { date, time };
  }

  function mapNotificationItem(item: any): NotificationItem {
    const { date, time } = formatDateTime(item.notificationDate);

    const typeMap: Record<string, 'improvement' | 'decline' | 'same'> = {
      up: 'improvement',
      down: 'decline',
      same: 'same',
    };

    const statusMap: Record<number, 'healthy' | 'attention' | 'critical'> = {
      0: 'healthy',
      1: 'attention',
      2: 'critical',
    };

    return {
      id: item._id,
      catId: item.notificationOrigin._id,
      catName: item.notificationOrigin.petName,
      catImageUrl: item.notificationOrigin.petPicture,
      newStatus: statusMap[item.notificationOrigin.petStatus.petCurrentStatus],
      reason: item.notificationDescription,
      date,
      time,
      isRead: item.notificationStatus,
      type: typeMap[item.notificationDirection] ?? undefined,
    };
  }

  async function getNotifications(company: string, token: string) {
    const request = await fetch(`http://ec2-52-15-64-33.us-east-2.compute.amazonaws.com/notification/select-all/${company}`, {
      headers: { "Authorization": token }
    });
    const response = await request.json();
    const data: NotificationItem[] = response.result.map(mapNotificationItem);
    setNotifications(data)
  }

  useEffect(() => {
    getNotifications(company, token)

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Conectado ao servidor');
    };

    ws.onmessage = async (event) => {
      try {
        if (event.data == "nova_notificacao") {
          console.log("[WS] Nova notificação recebida — buscando atualizações...");
          getNotifications(company, token)
        }
      } catch (error) {
        console.error('[WS] Erro ao processar mensagem:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Conexão encerrada');
    };

    ws.onerror = (e) => {
      console.error('[WS] Erro:', e);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-300 hover:text-white hover:bg-gray-800"
        onClick={toggleNotifications}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-lg font-medium text-white">Notificações</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-gray-700"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-800">
            <span className="text-sm text-gray-300">Mostrar não lidos</span>
            <Switch
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <StatusChange
                  key={notification.id}
                  catName={notification.catName}
                  catImageUrl={notification.catImageUrl}
                  prevStatus={notification.prevStatus as StatusType}
                  newStatus={notification.newStatus as StatusType}
                  reason={notification.reason}
                  date={notification.date}
                  time={notification.time}
                  isRead={notification.isRead}
                  type={notification.type}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                Não há notificações para exibir
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;