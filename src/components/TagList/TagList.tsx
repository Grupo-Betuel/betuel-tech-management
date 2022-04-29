import React from "react";
import styled from "styled-components";
import { Modal, ModalBody, Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { addTag, deleteTag, getTags } from "../../services/tags";
import { ITag } from "../../model/interfaces/TagModel";

const TagItem: any = styled.div`
  position: relative;
  border-radius: 20px;
  border: 1px solid #dc3545;
  background-color: ${(props: any) => props.selected ? '#dc3545' : 'white'};
  color: ${(props: any) => props.selected ? 'white' : '#dc3545'};
  padding: 3px 10px;
  margin-right: 10px;
  cursor: pointer;
`

const TagContainer: any = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  overflow: scroll;
  width: 100%;
  padding-bottom: 15px;

  .add-tag-icon {
    position: absolute;
    right: 0;
    top: 0;
    background: white;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    z-index: 9;
  }
`;

const TagNameInput = styled.input`
  width: 100%;
  border: unset;
  border-bottom: 1px solid #c1c1c1;
  border-radius: 0;
  font-size: 18px;
  &:focus {
    outline: unset;
  }
`


export interface ITagList {
    onSelectTag?: (tags: ITag[]) => any;
    onUpdateTags?: (tags: ITag[]) => any;
}
const TagList: React.FC<ITagList> = ({
                                         onSelectTag,
                                         onUpdateTags,
                                     }) => {
    const [selectedTags, setSelectedTags] = React.useState<string[]>(['']);
    const [tagNameIsOpen, setTagNameIsOpen] = React.useState(false);
    const [tagTitle, setTagTitle] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [modalRemoveTag, setModalRemoveTag] = React.useState(false);
    const [allTags, setAllTags] = React.useState<ITag[]>([]);
    const [tags, setTags] = React.useState([]);
    const [tagToRemove, setTagToRemove] = React.useState<ITag>();

    const getAllTags = async () => {
        setLoading(true)
        const allTags = await getTags();
        const initialTags = allTags.map((item: any) => item.title);
        setTags(initialTags);
        setAllTags(allTags);
        onUpdateTags && onUpdateTags(allTags)
        setLoading(false)
    }

    React.useEffect(() => {
        getAllTags().then();
    }, []);

    const onChangeTagTitle = (e: any) => {
        const { value } = e.target;
        setTagTitle(value);
    }
    const selectTag = (tag: string) => () => {
        let tags = [...selectedTags];

        if (!tags.find(item => tag === item)) {
            tags.push(tag);
            setSelectedTags([...tags]);
        } else {
            tags = selectedTags.filter(item => tag !== item);
            setSelectedTags([...tags]);
        }

        onSelectTag && onSelectTag(allTags.filter((tagItem) => tags.indexOf(tagItem.title) !== -1));
    }

    const handleAddTag = async () => {
        if(!tagTitle) return;
        try {
            setLoading(true);
            await addTag(JSON.stringify({ title: tagTitle }))
            setLoading(false);
            getAllTags()
            toggleTagNameModal();
            toast('Etiqueta Agregada');
        } catch(err: any) {
            toast(err.message, { type: 'error'});

        }

    }

    const toggleTagNameModal = () => setTagNameIsOpen(!tagNameIsOpen);
    const toggleRemoveTag = (item?: any) => (e?: any) => {
        e && e.stopPropagation();
        if(item) {
            const tag: any = allTags.find((ell: any) => ell.title === item) || {};
            setTagToRemove(tag)
        }
        setModalRemoveTag(!modalRemoveTag)
    };

    const removeTag = async () => {
        // if(!tagToRemove) return;
        try {
            setLoading(true);
            if(tagToRemove) {
                await deleteTag(JSON.stringify({ _id: tagToRemove._id }))
                selectTag(tagToRemove.title)()
            }
            setLoading(false);
            getAllTags()
            toggleRemoveTag()();
            toast('Etiqueta Eliminada!');
        } catch(err: any) {
            toast(err.message, { type: 'error'});

        }

    }

    return (
        <>
            <TagContainer className="mb-1 position-relative">
                {
                    !loading ? null :
                        <>
                            <div className="loading-sale-container">
                                <Spinner animation="grow" variant="secondary"/>
                            </div>
                        </>
                }
                <i className="bi bi-plus-lg text-danger cursor-pointer add-tag-icon" onClick={toggleTagNameModal}/>
                {
                    tags.map((tag, itag) => (
                        <TagItem onClick={selectTag(tag)}
                                 selected={selectedTags.indexOf(tag) !== -1} key={itag}>
                            <span>{tag}</span>
                            <i className="bi bi-x  cursor-pointer ms-2" onClick={toggleRemoveTag(tag)}/>
                        </TagItem>
                    ))
                }
            </TagContainer>
            <Modal centered isOpen={tagNameIsOpen} toggle={toggleTagNameModal}>
                <ModalBody>
                    <div className="w-100 d-flex align-items-center">
                        <TagNameInput onChange={onChangeTagTitle} type="text" placeholder="Nombre de la etiqueta" className="tag-name"/>
                        <i className="bi bi-send text-info cursor-pointer" onClick={handleAddTag}/>
                    </div>
                </ModalBody>
            </Modal>

            <Modal centered isOpen={modalRemoveTag} toggle={toggleRemoveTag()}>
                <ModalBody>
                    <div className="w-100 d-flex align-items-center">
                       <h4>
                           ¿Seguro que quieres eliminar la etiqueta {tagToRemove ? tagToRemove.title : ''}?
                       </h4>
                    </div>

                    <div className="d-flex justify-content-around mt-3">
                        <Button color="info" outline onClick={toggleRemoveTag()}>Cancelar</Button>
                        <Button color="danger" outline onClick={removeTag}>Eliminar</Button>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}


export default TagList;
