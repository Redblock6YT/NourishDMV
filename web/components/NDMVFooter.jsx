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
            <div className={[styles.doublegrid, styles.footer, styles.font].join(" ")}>
                <div>
                    <Image src="logo.svg" alt="NourishDMV Logo" height={45} width={200} />
                </div>
                {(props.citations != null) ? (
                    <div id="citationsdiv">
                        <h1>Citations/Attributions</h1>
                        {elements}
                    </div>
                ) : () => { }
                }
            </div>
        </>

    );
}