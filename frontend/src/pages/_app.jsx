import '../styles/globals.css';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>B2B E-commerce Product Management Dashboard (PoC)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Back-office Product Management Dashboard - Proof of Concept for Microservices on Kubernetes" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
