import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { CloseModalCrossIcon, SmallDownloadIcon } from "../../assets/icons"
import { closeModal } from "../../store/actions/ModalsActions"

import * as XLSX from "xlsx"

import './styles.sass'
import { setXlsxEquipmentData } from "../../store/reducers/XlsxEquipmentReducer/XlsxEquipmentReducer"
import store from "../../store"

const LoadXlsxEquipmentModal = () => {

    const dispatch = useDispatch()

    useEffect( () => {
        const handleClick = (event) => {
            if (event.target.className === 'modal-wrapper') {
                dispatch(closeModal())
            }
        }

        document.addEventListener('click', handleClick)

        return (() => {
            document.removeEventListener('click', handleClick)
        })
    }, [])

    const [file, setFile] = useState(null)
    const [data, setData] = useState([])

    const fileHandler = (event) => {
        if (event.target.files) {
            setFile(event.target.files[0])
            const reader = new FileReader();
            const rABS = !!reader.readAsBinaryString;
            reader.onload = e => {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                setData(data)
            };
            if (rABS) reader.readAsBinaryString(event.target.files[0]);
            else reader.readAsArrayBuffer(event.target.files[0]);
        }
    }

    const submit = () => {
        console.log(store.getState()?.modal)
        dispatch( setXlsxEquipmentData({data, equipmentIndex: store.getState()?.modal?.equipmentIndex}) )
        dispatch( closeModal() )
    }

    return (
        <div
            className='planogramm-modal'
        >
            <div
                className='planogramm-modal__close-icon'
                onClick={() => dispatch(closeModal())}
            >
                <CloseModalCrossIcon />
            </div>

            <div
                className="load-xlsx-equipment-modal"
            >
                <div
                    className="load-xlsx-equipment-modal__input-wrapper"
                >
                    <SmallDownloadIcon />
                    <input
                        type='file'
                        onChange={fileHandler}
                    />
                </div>

                <button
                    className="load-xlsx-equipment-modal__button"
                    disabled={!file}
                    onClick={submit}
                >
                    Загрузить {file ? `"${file.name}"` : ''}
                </button>
            </div>

        </div>
    )
}

export default LoadXlsxEquipmentModal