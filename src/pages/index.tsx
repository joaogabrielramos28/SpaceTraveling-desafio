import { GetStaticProps, NextComponentType } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
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

type PostData = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  first_publication_date: string;
};

interface PostProps {
  posts: PostData[];
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export const Home: NextComponentType<PostProps> = ({ posts }: PostProps) => {
  return (
    <>
      <Header />
      <section className={styles.postList}>
        {posts.map(post => (
          <div key={post.slug} className={styles.post}>
            <h2>{post.title}</h2>
            <p>{post.subtitle}</p>

            <div className={styles.postInfo}>
              <FiCalendar size={20} />
              <span>{post.first_publication_date}</span>
              <FiUser size={20} />
              <span>{post.author}</span>
            </div>
          </div>
        ))}

        <button className={styles.loadMore} type="button">
          Carregar mais posts
        </button>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { fetch: ['post.title', 'post.subtitle', 'post.author'] }
  );

  const posts: PostProps[] = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      subtitle: RichText.asText(post.data.subtitle),
      author: RichText.asText(post.data.author),
      first_publication_date: format(
        new Date(post.first_publication_date),
        ' dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};

export default Home;
