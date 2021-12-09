import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { ReactElement, useState } from 'react';
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

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(results);
  const [currentPage, SetCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    setNextPage(postsResults.next_page);
    SetCurrentPage(postsResults.page);

    const newPosts: Post[] = postsResults.results.map(post => {
      const newPost = {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          { locale: ptBR }
        ),
        data: {
          title: RichText.asText(post.data.title),
          subtitle: RichText.asText(post.data.subtitle),
          author: RichText.asText(post.data.author),
        },
      };
      return newPost;
    });
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Header />
      <section className={styles.postList}>
        {posts.map(post => (
          <div key={post.uid} className={styles.post}>
            <h2>{post.data.title}</h2>
            <p>{post.data.subtitle}</p>

            <div className={styles.postInfo}>
              <FiCalendar size={20} />
              <span>{post.first_publication_date}</span>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>
          </div>
        ))}

        {nextPage && (
          <button
            onClick={handleNextPage}
            className={styles.loadMore}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { fetch: ['post.title', 'post.subtitle', 'post.author'], pageSize: 1 }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        ' dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
