import { GetStaticProps, NextComponentType } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header/index';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextComponentType = () => {
  return (
    <>
      <Header />
      <section className={styles.postList}>
        <div className={styles.post}>
          <h2>Como utilizar Hooks</h2>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>

          <div className={styles.postInfo}>
            <FiCalendar size={20} />
            <span>19 Abr 2021</span>
            <FiUser size={20} />
            <span>João Gabriel</span>
          </div>
        </div>
        <div className={styles.post}>
          <h2>Criando um app CRA do zero</h2>
          <p>
            Tudo sobre como criar a sua primeira aplicação utilizando Create
            React App
          </p>

          <div className={styles.postInfo}>
            <FiCalendar size={20} />
            <span>19 Abr 2021</span>
            <FiUser size={20} />
            <span>João Gabriel</span>
          </div>
        </div>
        <button className={styles.loadMore} type="button">
          Carregar mais posts
        </button>
      </section>
    </>
  );
};

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };

export default Home;
