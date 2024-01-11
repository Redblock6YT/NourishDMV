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
                <div>
                    <Image src="logo.svg" alt="NourishDMV Logo" height={60} width={300} />
                    <div style={{ color: "#00000047", paddingLeft: "75px" }}>
                        <div>
                            <p style={{ fontSize: "25px", margin: "0px", fontWeight: "normal", display: "inline-block" }}>16701 Melford Blvd, Bowie, MD 20715</p>
                            <div style={{ display: "inline-block" }}>
                                <div className={styles.verticaldividerInline}></div>
                                <p style={{ fontSize: "25px", margin: "0px", fontWeight: "normal", display: "inline-block" }}>(410) 123-4567</p>
                            </div>

                            <div style={{ display: "inline-block" }}>
                                <div className={styles.verticaldividerInline}></div>
                                <p style={{ fontSize: "25px", margin: "0px", fontWeight: "normal", display: "inline-block" }}>contact@nourishdmv.com</p>
                            </div>

                            <div style={{ display: "inline-block" }}>
                                <div className={styles.verticaldividerInline}></div>
                                <p style={{ fontSize: "25px", margin: "0px", fontWeight: "normal", display: "inline-block" }}>Social Media: @nourishdmv</p>
                            </div>
                        </div>
                        <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                        <div className={styles.footergrid}>
                            <button className={styles.cubebutton}>Make a difference</button>
                            <button className={styles.cubebutton}>Accounts</button>
                            <button className={styles.cubebutton}>Events</button>
                            <button className={styles.cubebutton}>Blog</button>
                            <button className={styles.cubebutton}>About</button>
                            <button className={styles.cubebutton}>Privacy Policy</button>
                            <button className={styles.cubebutton}>Terms</button>
                        </div>


                        {(props.citations != null) ? (
                            <div id="citationsdiv">
                                <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                                <h1>Citations/Attributions</h1>
                                <div>

                                    {elements}
                                </div>
                            </div>
                        ) : () => { }
                        }
                        <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                        <p style={{ margin: "auto", fontSize: "20px", textAlign: "center" }}>Copyright © {new Date().getFullYear()} NourishDMV</p>
                    </div>
                </div>
            </div>
        </>

    );
}