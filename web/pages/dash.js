import Head from 'next/head'
import styles from '@/styles/Dash.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Footer from '@/components/NDMVFooter.jsx'
import axios from 'axios';
import Image from 'next/image'
import anime from 'animejs'
import Cookies from 'js-cookie'

export default function Dash() {
    return (
        <>
            <Head>
                <title>Dashboard | NourishDMV</title>
            </Head>
        </>
    );
}