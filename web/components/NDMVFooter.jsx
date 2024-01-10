import styles from '@/styles/Home.module.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Footer(props) {
    const [elements, setElements] = useState([]);
    console.log(props.citations)

    useEffect(() => {
        if (props.citations != null) {
            const newElements = props.citations.map(citation => (
                <div key={citation.name}>
                    <h3>{citation.name}</h3>
                    <p>{citation.citation}</p>
                </div>
            ));
            setElements(newElements);
        }
    }, [props.citations]);


    return (
        <>
            <div className={[styles.footer, styles.font].join(" ")}>
                <div className={styles.doublegrid}>
                    <div>
                        <Image src="logo.svg" alt="NourishDMV Logo" height={60} width={300} />
                        <div style={{ color: "#00000047", paddingLeft: "75px" }}>
                            <h3 style={{ fontSize: "25px", margin: "0px" }}>16701 Melford Blvd, Bowie, MD 20715</h3>
                            <h3 style={{ fontSize: "25px", margin: "0px" }}>(410) 123-4567</h3>
                            <h3 style={{ fontSize: "25px", margin: "0px" }}>contact@nourishdmv.com</h3>
                            <h3 style={{ fontSize: "25px", margin: "0px" }}>Facebook, Instagram, and TikTok: @nourishdmv</h3>
                            <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridGap: "15px" }}>
                                <button className={styles.cubebutton}>Home</button>
                                <button className={styles.cubebutton}>Accounts</button>
                                <button className={styles.cubebutton}>Make a difference</button>
                                <button className={styles.cubebutton}>Events</button>
                                <button className={styles.cubebutton}>Blog</button>
                                <button className={styles.cubebutton}>About</button>
                                <button className={styles.cubebutton}>Privacy Policy</button>
                                <button className={styles.cubebutton}>Terms</button>
                            </div>

                            <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                            <p style={{ margin: "auto", fontSize: "20px" }}>Copyright © {new Date().getFullYear()} NourishDMV</p>
                        </div>
                    </div>
                    {(props.citations != null) ? (
                        <div id="citationsdiv">
                            <h1>Citations/Attributions</h1>
                            {elements}
                        </div>
                    ) : () => { }
                    }
                </div>
            </div>
        </>

    );
}