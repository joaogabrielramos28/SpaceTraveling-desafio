/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactElement } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Comments from '../../components/comments';
import common from '../../styles/common.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): ReactElement {
  const router = useRouter();
  if (router.isFallback) {
    return <h2>Carregando...</h2>;
  }

  const sum = post.data.content.map(content => {
    const body = content.body.map(data => {
      const words: string[] = data.text.split(' ');
      const postWords = +words.length;

      return postWords;
    });

    const heading = RichText.asText(content.heading).split(' ').length;

    body.push(heading);
    return body;
  });

  function getTotalWords(total, item): number {
    return total + item;
  }
  const SumWordsPerContent = sum.map(array => {
    const arraySum = array.reduce(getTotalWords, 0);

    return arraySum;
  });

  const total = SumWordsPerContent.reduce(getTotalWords, 0);

  const timeToRead = Math.ceil(total / 200);

  return (
    <>
      <Header />
      <img
        src={post.data.banner.url}
        alt={post.data.title}
        className={styles.banner}
      />
      <div className={styles.container}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfos}>
          <span>
            <FiCalendar />
            {post.first_publication_date}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {timeToRead} min
          </span>
        </div>
        <span className={styles.editedOn}>{post.last_publication_date}</span>
        {post.data.content.map(content => (
          <article key={content.heading} className={styles.postContent}>
            <div
              className={styles.articleTitle}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.heading),
              }}
            />
            {}

            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </article>
        ))}
        <div className={styles.othersPosts}>
          {navigation.prevPost &&
            navigation.prevPost.map(prevPost => (
              <>
                <p>
                  {RichText.asText(prevPost.data.title) || ''}
                  <Link href={`/post/${prevPost.uid}`}>
                    <a>Post anterior</a>
                  </Link>
                </p>
              </>
            ))}
          {navigation.nextPost &&
            navigation.nextPost.map(nextPost => (
              <>
                <p>
                  {RichText.asText(nextPost.data.title) || ''}
                  <Link href={`/post/${nextPost.uid}`}>
                    <a>Próximo post</a>
                  </Link>
                </p>
              </>
            ))}
        </div>
        <Comments />

        {(preview && (
          <Link href="/api/exit-preview">
            <a className={common.previewExit}>Sair do modo Preview</a>
          </Link>
        )) || <p />}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref || null,
  });

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      ' dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    last_publication_date: format(
      new Date(response.last_publication_date),
      "'Editado em' dd MMM yyyy', às 'H:m'",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
    revalidate: 60 * 30, // 30 min
  };
};
