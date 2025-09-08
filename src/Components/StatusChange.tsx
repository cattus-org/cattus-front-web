import { ArrowUp, ArrowDown } from 'lucide-react';
type StatusType = 'critical' | 'attention' | 'healthy';

interface StatusChangeProps {
  catName: string;
  catImageUrl: string;
  prevStatus: StatusType;
  newStatus: StatusType;
  reason: string;
  date: string;
  time: string;
  isRead: boolean;
  type?: 'improvement' | 'decline' | 'same';
}

const StatusChange = ({
  catName,
  catImageUrl,
  prevStatus,
  newStatus,
  reason,
  date,
  time,
  isRead,
  type
}: StatusChangeProps) => {
  const determineChangeType = (): 'improvement' | 'decline' | 'same' => {
    if (!prevStatus || prevStatus === newStatus) {
      return 'same';
    }
    
    if (
      (prevStatus === 'critical' && (newStatus === 'attention' || newStatus === 'healthy')) ||
      (prevStatus === 'attention' && newStatus === 'healthy')
    ) {
      return 'improvement';
    }
    
    return 'decline';
  };
  
  const changeType = type || determineChangeType();

  const getActionText = () => {
    if (!prevStatus) {
      return `entrou em`;
    }
    
    if (changeType === 'improvement') {
      if (newStatus === 'healthy') {
        return `retornou para seu`;
      }
      return `subiu para`;
    }
    
    if (changeType === 'decline') {
      return `entrou em`;
    }
    
    return `mudou para`;
  };
  
  const getFormattedStatusText = () => {
    if (newStatus === 'healthy' && changeType === 'improvement') {
      return `estado saudável`;
    }
    
    if (newStatus === 'attention') {
      return `estado de atenção`;
    }
    
    if (newStatus === 'critical') {
      return `estado crítico`;
    }
    
    return `estado ${getStatusText(newStatus)}`;
  };

  const getStatusText = (status: StatusType): string => {
    switch (status) {
      case 'healthy':
        return 'saudável';
      case 'attention':
        return 'estado de atenção';
      case 'critical':
        return 'estado crítico';
      default:
        return '';
    }
  };

  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case 'healthy':
        return '#42AA49';
      case 'attention':
        return '#FED400';
      case 'critical':
        return '#FF0200';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`p-3 mb-2 rounded-md relative ${
        isRead ? 'bg-gray-800' : 'bg-gray-700'
      }`}
      style={{
        borderColor: getStatusColor(newStatus),
        borderWidth: isRead ? '0px' : '1px',
        borderStyle: 'solid'
      }}
    >
      <div className="flex">

        <div className="relative mr-3">
          <img 
            src={catImageUrl} 
            alt={catName} 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div 
            className="absolute bottom-5 left-6 w-5 h-5 rounded-full border-2 border-gray-800 flex items-center justify-center"
            style={{ backgroundColor: getStatusColor(newStatus) }}
          >
            {changeType === 'improvement' && (
              <ArrowUp size={12} color={newStatus === 'attention' ? 'black' : 'white'} />
            )}
            {changeType === 'decline' && (
              <ArrowDown size={12} color={newStatus === 'attention' ? 'black' : 'white'} />
            )}
          </div>
        </div>
        
        <div className="flex-1 pl-2 pr-16">
          <div className="text-white">
            <span className="font-bold">{catName}</span>{' '}
            <span>{getActionText()}</span>{' '}
            <span 
              className="font-semibold" 
              style={{ color: getStatusColor(newStatus) }}
            >
              {getFormattedStatusText()}
            </span>
            {reason && (
              <>
                <span className="font-semibold">
                  : {reason}
                </span>
                .
              </>
            )}
            {newStatus === 'healthy' && changeType === 'improvement' && ` Parabéns, ${catName}!`}
          </div>
        </div>
        
        <div className="absolute right-3 top-3 text-right text-xs text-gray-400">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      </div>
    </div>
  );
};

export default StatusChange;