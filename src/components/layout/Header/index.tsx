import { Button, Tooltip } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface HeaderProps {
  onCreateNote?: () => void;
}

export const Header = ({ onCreateNote }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Markdown Notes</div>
      <div className={styles.actions}>
        <Tooltip title="新建笔记">
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNote}>
            新建
          </Button>
        </Tooltip>
        <Tooltip title="设置">
          <Button icon={<SettingOutlined />} onClick={() => navigate('/settings')} />
        </Tooltip>
      </div>
    </header>
  );
};
