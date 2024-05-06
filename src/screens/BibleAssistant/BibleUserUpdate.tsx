import BibleUserForm from "./components/BibleUserForm";
import {useEffect, useState} from "react";
import {BibleUserModel} from "../../models/interfaces/BibleModel";
import {getBibleUserByPhone, updateBibleUser} from "../../services/bible/bibleUsersService";
import {toast} from "react-toastify";
import {Alert, Spinner} from "reactstrap";
import {useParams} from "react-router";

export const BibleUserUpdate = () => {
    const [editUser, setEditUser] = useState<BibleUserModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const params: any = useParams();

    const handleBibleUser = async (phone: string) => {
        setLoading(true);
        const data = await getBibleUserByPhone(params.phone);
        setEditUser(data);
        setLoading(false);
    }

    useEffect(() => {
        if (params.phone) {
            handleBibleUser(params.phone);
        }
    }, [params.phone]);

    const handleEditUser = async (user: BibleUserModel) => {
        await updateBibleUser(user);
        toast("Usuario actualizado", {type: "default"});
        setIsSuccess(true);
    }


    return (
        <div className="flex justify-center align-items-center w-100 h-[100dvh] p-4 font-medium">
            {
                loading && <div className="loading-sale-container">
                    <Spinner animation="grow" variant="secondary"/>
                </div>
            }
            {editUser && !isSuccess && <BibleUserForm bibleUser={editUser} onSubmit={handleEditUser}/>}
            {isSuccess && <Alert isOpen={true}>
                ¡Usuario actualizado!
            </Alert>}
        </div>
    )
}