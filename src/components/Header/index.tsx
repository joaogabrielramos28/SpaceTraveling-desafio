import { NextComponentType } from 'next';
import styles from './header.module.scss';

const Header: NextComponentType = () => {
  return (
    <div className={styles.container}>
      <img src="/Logo.svg" alt="logo" />
    </div>
  );
};

export default Header;
