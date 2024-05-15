import React, {useEffect, useState} from "react";
import {
    addBibleGroup,
    deleteBibleGroup,
    syncBibleGroup,
    updateBibleGroup
} from "../../services/bible/bibleGroupsService";
import {
    BibleDayModel,
    BibleGroupModel, BibleGroupParticipationModel, BibleStudyActionsModel, BibleStudyInteractionModes,
    BibleStudyModel, BibleUserModel
} from "../../models/interfaces/BibleModel";
import {Button, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import BibleGroupForm from "./components/BibleGroupsForm";
import BibleGroupMng from "./components/BibleGroupMng/BibleGroupMng";
import "./BibleAssistant.scss";
import BibleDaysMng from "./components/BibleDaysMng/BibleDaysMng";
import {Messaging} from "../../components";
import {whatsappSessionKeys} from "../../models/interfaces/WhatsappModels";
import {useConfirmAction} from "../../components/hooks/confirmActionHook";
import {toast} from "react-toastify";
import useWhatsapp from "../../components/hooks/UseWhatsapp";
import {
    addActionToBibleStudy,
    addBibleStudy,
    addDayToBibleStudy,
    addGroupToBibleStudy,
    getBibleStudies, getBibleStudyStatus, updateBibleStudy
} from "../../services/bible/bibleStudyService";
import {BibleStudyActionsMng} from "./components/BibleStudyActionsMng/BibleStudyActionsMng";
import {FloatButton} from "../Dashboard/Dashboard";
import BibleStudiesForm from "./components/BibleStudiesForm";
import {deleteBibleDay, updateBibleDay} from "../../services/bible/bibleDayService";
import {
    addBibleStudyAction,
    deleteBibleStudyAction, runBibleStudyAction,
    updateBibleStudyAction
} from "../../services/bible/bibleStudyActionService";
import {deleteBibleDayResource} from "../../services/bible/bibleDayResourceService";
import {handleScheduleBibleStudy, handleScheduleWsPromotion} from "../../services/promotions";
import {updateBibleGroupParticipation} from "../../services/bible/bibleGroupParticipationService";

const mockDays = [{
    _id: "1",
    position: 1,
    title: 'Dia 1',
    description: ' string',
    resources: [
        {
            _id: "1sdsdsd",
            title: 'Imagen dia 1',
            description: 'la biblia genesi 1',
            type: 'image',
            url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
            updateDate: new Date(),
            createDate: new Date(),
            language: 'es',
        },
        {
            _id: "2sdsdsd",
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

},

    {
        _id: "2dshhhsc",
        position: 1,
        title: 'Dia 1',
        description: ' string',
        resources: [
            {
                _id: "2gdgdfgdfgdf",
                title: 'Imagen dia 1',
                description: 'la biblia genesi 1',
                type: 'lecture',
                url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
                updateDate: new Date(),
                createDate: new Date(),
                language: 'es',
            },
            {
                _id: "1sfdsfdsghjuyt",
                title: 'Imagen dia 1',
                description: 'la biblia genesi 1',
                type: 'image',
                url: 'https://www.southernliving.com/thmb/bTfvG-5_DdHLLDxBNdZQaAvxaek=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SL_BIBLE-VERSE_011-f0d6c4cde0b641dca6a47686ee980cbc.jpg',
                updateDate: new Date(),
                createDate: new Date(),
                language: 'es',
            },
            {
                _id: "3ghjhgsfdfvc",
                title: 'Imagen dia 1',
                description: 'la biblia genesi 1',
                type: 'audio',
                url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
                updateDate: new Date(),
                createDate: new Date(),
                language: 'es',
            },
            {
                _id: "4ddfdfghjwerw",
                title: 'Imagen dia 1',
                description: 'la biblia genesi 1',
                type: 'video',
                url: 'https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=',
                updateDate: new Date(),
                createDate: new Date(),
                language: 'es',
            },
        ],
        updateDate: new Date(),
        createDate: new Date(),
    }

];
export type BibleAssistantActionTypes =
    'sync-ws-groups'
    | 'sync-ws-group-users'
    | 'sync-days'
    | 'sync-resources'
    | 'delete-group'
    | 'sync-all';

export type BibleStudyTabs = 'days' | 'actions' | 'members';
export const BibleAssistant = () => {
    const [studies, setStudies] = React.useState<BibleStudyModel[]>([]);
    const [loading, setLoading] = React.useState<boolean>();
    const [selectedStudy, setSelectedStudy] = React.useState<BibleStudyModel>();
    const [selectedGroup, setSelectedGroup] = React.useState<BibleGroupModel>();
    const [bibleGroupModal, setBibleGroupModal] = useState(false);
    const [whatsappModal, setWhatsappModal] = useState(false);
    const [studyFormModal, setStudyFormModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState<BibleStudyActionsModel>();
    const [selectedDay, setSelectedDay] = useState<BibleDayModel>();

    const onChangeRunActionSelector = (e: React.ChangeEvent<HTMLInputElement>) => {
        const day = selectedStudy?.days.find(d => d._id === e.target.value);
        setSelectedDay(day);
    }
    const resetSelectedAction = () => setSelectedAction(undefined);

    const {
        fetchWsSeedData,
        seedData: {groups: wsGroups},
        logged: wsIsLogged
    } = useWhatsapp(whatsappSessionKeys.bibleAssistant);

    const [activeTab, setActiveTab] = useState<BibleStudyTabs>('days');
    const handleActiveTab = (tab: BibleStudyTabs) => () => setActiveTab(tab);

    const handleConfirmedAction = async (actionToConfirm?: BibleAssistantActionTypes, data?: any) => {
        setLoading(true);
        switch (actionToConfirm) {
            case 'sync-ws-groups':
                await fetchWsSeedData(whatsappSessionKeys.bibleAssistant, 'groups')
                toast('¡Datos Actualizados!', {type: 'success'});
                break;
            case 'delete-group':
                if (selectedGroup?._id) {
                    await deleteBibleGroup(selectedGroup?._id);
                    await fetchData();
                }
                break;
            case 'sync-ws-group-users':
                break;
            case 'sync-days':
                break;
            case 'sync-resources':
                break;
            case 'sync-all':
                break;
        }
        setLoading(false);

    }

    const handleDeniedAction = () => {

    }


    const {
        handleSetActionToConfirm,
        resetActionToConfirm,
        ConfirmModal,
    } = useConfirmAction<BibleAssistantActionTypes, any>(handleConfirmedAction, handleDeniedAction)

    const toggleWhatsappModal = () => setWhatsappModal(!whatsappModal);
    const toggleStudyFormModal = () => setStudyFormModal(!studyFormModal);
    const toggleBibleGroup = () => setBibleGroupModal(!bibleGroupModal);

    React.useEffect(() => {
        fetchData();
    }, []);

    React.useEffect(() => {
        const study = studies.find(g => g._id === selectedStudy?._id);
        study && setSelectedStudy(study);
        const updatedGroup = study?.groups.find(g => g._id === selectedGroup?._id);
        updatedGroup && setSelectedGroup(updatedGroup)
    }, [studies]);

    const fetchData = async () => {
        setLoading(true);
        await handleGetBibleStudies();
        setLoading(false);
    }
    const handleGetBibleStudies = async () => {
        const data = await getBibleStudies();
        setStudies(data);
        setSelectedStudy(data[1]);
    }

    const handleSelectStudy = (e: React.ChangeEvent<HTMLInputElement>) => {
        const study = studies.find(g => g._id === e.target.value);
        setSelectedStudy(study);
    }

    const handleSelectGroup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const group = selectedStudy?.groups.find(g => g._id === e.target.value);
        setSelectedGroup(group);
        const passedDaysFromStartDate = (Math.floor(
            (new Date().getTime() - new Date(group?.startDate || new Date()).getTime()) / (1000 * 60 * 60 * 24),
        )) + 1;

        const currentDay = selectedStudy?.days.find(d => d.position === passedDaysFromStartDate);
        setSelectedDay(currentDay);
        setActiveTab('members');
    }

    const handleBibleGroupSubmit = async (group: BibleGroupModel) => {
        setLoading(true);
        setBibleGroupModal(false);
        if (selectedStudy) {
            if (group._id) {
                // eslint-disable-next-line no-undef
                await updateBibleGroup({
                    _id: group._id,
                    description: group.description,
                    startDate: group.startDate,
                    title: group.title,
                    whatsappGroupID: group.whatsappGroupID,
                    coordinators: group.coordinators,
                    dueDaysLimit: group.dueDaysLimit,
                });
            } else {
                await addGroupToBibleStudy({group, study: selectedStudy});
            }
            await fetchData();
        } else {
            toast('No se ha seleccionado un estudio', {type: 'error'});
        }
        setLoading(false);
    }

    const restartStudyScheduling = async () => {
        if(studySchedulingStatus === 'running' && selectedStudy && selectedStudy._id) {
            await runBibleStudy(selectedStudy, 'run');
        }
    }
    const handleBibleStudySubmit = async (study: BibleStudyModel) => {
        setLoading(true);
        toggleStudyFormModal();

        if (study._id) {
            await updateBibleStudy(study);

        } else {
            await addBibleStudy(study);
        }

        await fetchData();
        setLoading(false);
    }

    const notifyStudyNotSelected = () => {
        toast('No se ha seleccionado un estudio', {type: 'error'});
    }

    const handleDaySubmit = async (day: BibleDayModel) => {
        if (selectedStudy) {
            if (day._id) {
                await updateBibleDay(day);
            } else {
                await addDayToBibleStudy({day, study: selectedStudy});
            }
            await fetchData();
        } else {
            notifyStudyNotSelected();
        }
    }

    const handleActionSubmit = async (action: BibleStudyActionsModel) => {
        if (selectedStudy) {
            if (action._id) {
                await updateBibleStudyAction(action);
            } else {
                await addActionToBibleStudy({action, study: selectedStudy});
            }
            await fetchData();
        } else {
            notifyStudyNotSelected();
        }
    }

    const handleActionDelete = async (id?: string) => {
        if (id) {
            await deleteBibleStudyAction(id);
            await fetchData();
        } else {
            toast('id action undefined', {type: 'error'});
        }

    }

    const handleActionSelection = async (action: BibleStudyActionsModel) => {
        setSelectedAction(action);
    }

    const handleDayDelete = async (id?: string) => {
        if (id) {
            await deleteBibleDay(id);
            await fetchData();
        } else {
            toast('day id undefined', {type: 'error'});
        }

    }

    const handleResourceDelete = async (id?: string) => {
        if (id) {
            await deleteBibleDayResource(id);
            await fetchData();
        } else {
            toast('day id undefined', {type: 'error'});
        }

    }


    const [bibleStudyRunning, setBibleStudyRunning] = useState<{ [key: string]: boolean }>({});
    const runBibleStudy = async (bibleStudy: BibleStudyModel, actionType?: 'run' | 'stop') => {
        setLoading(true);
        const action = actionType || (studySchedulingStatus === 'running' ? "stop" : "run");

        const response: any = await (
            await handleScheduleBibleStudy(action, bibleStudy)
        ).json();

        const status: 'running' | 'stopped' | 'error' = response.status;
        toast(`Bible Study Promotion is ${status}`);
        setStudySchedulingStatus(status);
        setBibleStudyRunning({
            ...bibleStudyRunning,
            [bibleStudy._id || '']: status === 'running'
        });
        setLoading(false);
    };

    const executeSelectedAction = async () => {
        if(!selectedDay || !selectedAction || !selectedGroup) {
            toast('¡Selecciona un dia y una accion!', {type: 'error'});
            return;
        }

        const data = {
            group: selectedGroup as BibleGroupModel,
            action: selectedAction,
            day: selectedDay,
            studyId: selectedStudy?._id,
        }
        setLoading(true);
        await runBibleStudyAction(data);
        setLoading(false);
        toast('¡Acción ejecutada!', {type: 'success'});
    }

    const handleBibleGroupParticipation = async (p: BibleGroupParticipationModel) => {
        setLoading(true);
        await updateBibleGroupParticipation(p);
        if(selectedGroup) {
            setSelectedGroup({
                ...selectedGroup,
                users: (selectedGroup?.users || []).map( u => {
                    if(u.participations.find(part => part._id === p._id)) {
                        return {
                            ...u,
                            participations: u.participations.map(part => part._id === p._id ? p : part)
                        }
                    }

                    return u;
                })
            })
        }
        setLoading(false);
    }

    const [studySchedulingStatus, setStudySchedulingStatus] = useState<'running' | 'stopped' | 'error'>('stopped');
    const handleStudySchedulingStatus = async () => {
        if(selectedStudy?._id) {
            const { status } = await getBibleStudyStatus(selectedStudy._id);
            setStudySchedulingStatus(status);
        }
    }


    const handleBibleGroupSync = async () => {
        if(!selectedGroup?.whatsappGroupID) {
            toast('¡Selecciona un grupo con whatsappGroupID!', {type: 'error'})
            return;
        }
        setLoading(true);
        await syncBibleGroup(selectedGroup?.whatsappGroupID);
        setLoading(false);
    }
    useEffect(() => {
        handleStudySchedulingStatus()
    }, [selectedStudy?._id])

    useEffect(() => {
        restartStudyScheduling();
    }, [selectedStudy])




    return (
        <div className="w-100 d-flex justify-content-center align-items-center flex-column bible-assistant"
             style={{width: "100dvw"}}>
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}

            <h1>Bible Assistant</h1>
            <div className="d-flex justify-content-around w-100">
                <div className="d-flex gap-2 align-items-center">
                    {selectedStudy && <Button onClick={toggleBibleGroup} color="info" outline>
                        {selectedGroup ? 'Editar' : 'Agregar'} Grupo</Button>}
                </div>
                <div className="d-flex flex-column gap-2">
                    <FormGroup>
                        <Input placeholder="Estudios"
                               onChange={handleSelectStudy}
                               value={selectedStudy?._id}
                               type="select">
                            <option value="">Select Study</option>
                            {
                                studies.map(
                                    (g: BibleStudyModel, k) =>
                                        <option value={g._id || k}>{g.title}</option>
                                )
                            }
                        </Input>
                    </FormGroup>
                    {selectedStudy &&
                        <Button onClick={() => runBibleStudy(selectedStudy)} color="primary" className="my-3" outline>
                            {studySchedulingStatus === 'running' ? 'Stop' : 'Run'}
                        </Button>
                    }
                    {selectedStudy &&
                        <FormGroup>
                            <Input placeholder="Tipo"
                                   onChange={handleSelectGroup}
                                   value={selectedGroup?._id}
                                   type="select">
                                <option value="">Select Group</option>
                                {
                                    selectedStudy?.groups.map(
                                        (g: BibleGroupModel, k) =>
                                            <option value={g._id || k}>{g.title}</option>
                                    )
                                }
                            </Input>
                        </FormGroup>}
                </div>
                <div className="d-flex align-items-center gap-3">

                    <Button onClick={toggleWhatsappModal} color="info" className="d-flex align-items-center gap-2"
                            outline>
                        <i className="bi bi-whatsapp"/>
                        Whatsapp
                    </Button>
                </div>

            </div>
            {selectedStudy &&
                <div className="bible-assistant__content">
                    <ul className="nav nav-tabs w-100">
                        {selectedGroup && <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'members' ? 'active' : ''}`} aria-current="page"
                               href="javascript:;"
                               onClick={handleActiveTab('members')}>Miembros</a>
                        </li>}
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'days' ? 'active' : ''}`} aria-current="page"
                               href="#"
                               onClick={handleActiveTab('days')}>Dias</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${activeTab === 'actions' ? 'active' : ''}`} href="#"
                               onClick={handleActiveTab('actions')}>Acciones</a>
                        </li>
                    </ul>
                    <div className={`w-100 ${activeTab === 'members' ? 'd-block' : 'd-none'}`}>
                        {selectedGroup &&
                            <BibleGroupMng
                                handleParticipations={handleBibleGroupParticipation}
                                study={selectedStudy as BibleStudyModel}
                                addCoordinator={handleBibleGroupSubmit}
                                group={selectedGroup as BibleGroupModel}
                                onGroupSync={handleBibleGroupSync}
                                onGroupDelete={(group: BibleGroupModel) => handleSetActionToConfirm('delete-group', group)}
                            />}
                    </div>
                    <div className={`w-100 ${activeTab === 'days' ? 'd-block' : 'd-none'}`}>
                        <BibleDaysMng study={selectedStudy}
                                      onDaySubmit={handleDaySubmit}
                                      onResourceDelete={handleResourceDelete}
                                      onDayDelete={handleDayDelete}/>
                    </div>
                    <div className={`w-100 ${activeTab === 'actions' ? 'd-block' : 'd-none'}`}>
                        <BibleStudyActionsMng onActionSubmit={handleActionSubmit} onActionDelete={handleActionDelete}
                                              study={selectedStudy}
                                              onActionRun={handleActionSelection}
                                              enableExecution={!!selectedGroup}
                        />
                    </div>

                </div>}
            <Modal isOpen={bibleGroupModal} toggle={toggleBibleGroup}>
                <ModalHeader toggle={toggleBibleGroup}>Crea un Nuevo Grupo Biblico</ModalHeader>
                <ModalBody>
                    <BibleGroupForm groups={selectedStudy?.groups || []} editableGroup={selectedGroup}
                                    onSubmit={handleBibleGroupSubmit}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleBibleGroup}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={!wsIsLogged || whatsappModal} toggle={toggleWhatsappModal}>
                <ModalHeader toggle={toggleWhatsappModal}>Envia Mensajes</ModalHeader>
                <ModalBody>
                    <Messaging whatsappSession={whatsappSessionKeys.bibleAssistant}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleWhatsappModal}>Cancel</Button>
                </ModalFooter>

            </Modal>
            <Modal isOpen={!!selectedAction} toggle={resetSelectedAction}>
                <ModalHeader toggle={resetSelectedAction}>Crea un Nuevo Estudio Biblico</ModalHeader>
                <ModalBody>
                    <Input type="select" onChange={onChangeRunActionSelector}>
                        <option value="">Seleccionar Dia</option>
                        {selectedStudy?.days.map((day) => (
                            <option value={day._id} key={day._id} selected={selectedDay?._id === day._id}>Dia {day.position}</option>
                        ))
                        }
                    </Input>
                </ModalBody>
                <ModalFooter className="d-flex gap-3 justify-content-between">
                    <Button color="danger" onClick={resetSelectedAction}>Cancelar</Button>
                    <Button disabled={!selectedDay} color="primary" onClick={executeSelectedAction}>Ejecutar Action</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={studyFormModal} toggle={toggleStudyFormModal}>
                <ModalHeader toggle={toggleStudyFormModal}>Crea un Nuevo Estudio Biblico</ModalHeader>
                <ModalBody>
                    <BibleStudiesForm onSubmit={handleBibleStudySubmit} study={selectedStudy}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleStudyFormModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <ConfirmModal/>
            {selectedStudy ?
                <FloatButton
                    className="btn btn-outline-danger edit-study-btn"
                    onClick={toggleStudyFormModal}
                >
                    <i className="bi bi-pencil"/>
                </FloatButton>
                :
                <FloatButton
                    className="btn btn-outline-danger create-product-button"
                    onClick={toggleStudyFormModal}
                >
                    <i className="bi-plus"/>
                </FloatButton>
            }
        </div>
    )
}