import React, {useState} from "react";
import {getBibleGroups} from "../../services/bibleAssistantService";
import {BibleDayResources, BibleDays, BibleGroups} from "../../model/interfaces/BibleModel";
import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {productParamsTypes} from "../../components/ProductModalForm/ProductModalForm";
import BibleGroupForm from "./components/BibleGroupsMng";
import BibleUsersTable from "./components/BibleUsersTable";
import "./BibleAssistant.scss";
import BibleDaysMng from "./components/BibleDaysMng/BibleDaysMng";
export const BibleAssistant = () => {
    const [groups, setGroups] = React.useState<BibleGroups[]>([]);
    const [loading, setLoading] = React.useState<boolean>();
    const [selectedGroup, setSelectedGroup] = React.useState<BibleGroups>({
        users: [{
            firstName: 'string',
            lastName: 'string',
            phone: 'string',
            password: 'string',
            lastCongrat: new Date(),
            status: 'active',
            bibleDay: { position: 300 } as any,
            updateDate: new Date(),
            createDate: new Date()
        } as any]
    } as any);
    const [bibleGroupModal, setBibleGroupModal] = useState(false);
    const toggleBibleGroup = () => setBibleGroupModal(!bibleGroupModal);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await handleGetBibleGroups();
        setLoading(false);
    }
    const handleGetBibleGroups = async () => {
        setGroups(await getBibleGroups());
    }

    const handleSelectGroup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const group = groups.find(g => g._id === e.target.value);
        setSelectedGroup(group || selectedGroup);
    }

    const handleBibleGroupSubmit = (group: BibleGroups) => {

    }


    return (
        <div className="w-100 d-flex justify-content-center align-items-center flex-column bible-assistant"
             style={{width: "100dvw"}}>
            <h1>Bible Assistant</h1>
            <div className="d-flex justify-content-around w-100">
                <Button onClick={toggleBibleGroup} color="info" outline>Crear Grupo</Button>
                <FormGroup>
                    <Input placeholder="Tipo"
                           onChange={handleSelectGroup}
                           type="select">
                        <option value="">Select Group</option>
                        {
                            groups.map(
                                (g: BibleGroups, k) =>
                                    <option value={g._id || k}>{g.title}</option>
                            )
                        }
                    </Input>
                </FormGroup>
                <Button onClick={toggleBibleGroup} color="info" outline>Sync Group Users</Button>

            </div>
            <div className="bible-assistant__content">
                <BibleUsersTable bibleUsers={selectedGroup?.users || []}/>
                <BibleDaysMng bibleDays={[{
                    position: 1,
                    title: 'Dia 1',
                    description:' string',
                    resources: [
                        {
                            title: 'Imagen dia 1',
                            description: 'la biblia genesi 1',
                            type: 'image',
                            url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
                            updateDate: new Date(),
                            createDate: new Date(),
                            language: 'es',
                        },
                        {
                            title: 'Imagen dia 1',
                            description: 'la biblia genesi 1',
                            type: 'image',
                            url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
                            updateDate: new Date(),
                            createDate: new Date(),
                            language: 'es',
                        },
                    ],
                    updateDate: new Date(),
                    createDate: new Date(),
                }]}/>
            </div>
            <Modal isOpen={bibleGroupModal} toggle={toggleBibleGroup}>
                <ModalHeader toggle={toggleBibleGroup}>Crea un Nuevo Grupo Biblico</ModalHeader>
                <ModalBody>
                    <BibleGroupForm onSubmit={handleBibleGroupSubmit}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleBibleGroup}>Cancel</Button>
                    <Button color="primary" onClick={toggleBibleGroup}>Submit</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}