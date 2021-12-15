import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  const { pathname } = useRouter() || { pathname: '' };

  return (
    <div className={pathname === '/' ? styles.container : styles.containerPost}>
      <Link href="/">
        <img src="/Logo.svg" alt="logo" />
      </Link>
    </div>
  );
}
