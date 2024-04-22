import React, { useEffect, useState} from "react";
import {
    Button,
    Input,
    Spinner
} from "reactstrap";
import {CompanyModel} from "../../models/companyModel";
import {addCompany, deleteCompany, getCompanies, updateCompanies} from "../../services/companies";
import "./CompanyManagement.scss"
import {toast} from "react-toastify";
import {onChangeMediaToUpload} from "../../utils/gcloud.utils";
import {IMedia, IMediaTagTypes} from "../../components/GCloudMediaHandler/GCloudMediaHandler";
import {deletePhoto} from "../../services/gcloud";
import {useHistory} from "react-router";
import {CompanyList} from "./components/CompanyList/CompanyList";
import {
    addCategory,
    deleteCategory,
    getAllCategories,
    updateCategories
} from "../../services/categoryService";
import {ICategory} from "../../models/CategoryModel";
import {CategoryList} from "./components/CategoryList/CategoryList";
export type CompanyMngTabsTypes = 'company' | 'category';

export const CompanyManagement = () => {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const [activeTab, setActiveTab] = useState<CompanyMngTabsTypes>('category');
    const [originalCat, setOriginalCat] = useState<ICategory[]>([]);


    useEffect(() => {
        handleGetCompanies();
        handleGetCategories();
    }, [])

    const handleGetCompanies = async () => {
        setLoading(true);
        setCompanies(await getCompanies())
        setLoading(false);
    }

    const handleGetCategories = async () => {
        setLoading(true);
        const cats = await getAllCategories()
        setCategories(cats)
        setOriginalCat(cats)
        setLoading(false);
    }

    const updateCompany = async (company: CompanyModel) => {
        // const company = isEditing[companyId];
        // if (company && validCompany(company as CompanyModel)) {
            setLoading(true)
            await updateCompanies(JSON.stringify(company));
            await handleGetCompanies();
            toast("Compañia actualizada con exito")
            setLoading(false)
            // setIsEditing({
            //     ...isEditing,
            //     [companyId]: null
            // });
        // }
    }
    const updateCategory = async (category: ICategory) => {
        setLoading(true)
        await updateCategories(JSON.stringify(category));
        await handleGetCategories();
        toast("Categoria actualizada con exito")
        setLoading(false)
    }



    const handleAddNewCompany = async (company: CompanyModel) => {
        setLoading(true);
        await addCompany(JSON.stringify(company));
        await handleGetCompanies();
        toast("Compañia creada con exito")
        setLoading(false);
    }

    const handleAddNewCategory = async (category: ICategory) => {
        setLoading(true);
        await addCategory(JSON.stringify(category));
        await handleGetCategories();
        toast("Categoria creada con exito")
        setLoading(false);
    }

    const handleDeleteCompany = async (companyToDelete: CompanyModel) => {
        setLoading(true);
        await deleteCompany(JSON.stringify(companyToDelete));
        await handleGetCompanies();
        toast("Compañia eliminada con exito")
        setLoading(false);
    }

    const handleDeleteCategory = async (category: ICategory) => {
        setLoading(true);
        await deleteCategory(JSON.stringify(category));
        await handleGetCategories();
        toast("Categoria eliminada con exito")
        setLoading(false);
    }

    const onChangeMediaFile = async (data: CompanyModel | ICategory, tag: IMediaTagTypes, event: any, onLoadedMedia?:  (media: IMedia) => Promise<void>) => {
            // const companyIdString = companies.find(company => company.companyId === companyId)?._id;
            const uploadCallBack = async (media: IMedia) => {

                // const companyToUpdate = isEditing[companyIdString];
                if (data) {
                    setLoading(true);
                    const mediaToDelete = (data as any)[tag as any]?.split('/')?.pop() as string;
                    mediaToDelete && await deletePhoto(mediaToDelete);
                    if(activeTab === 'company') {
                        await updateCompanies(JSON.stringify({
                            ...data,
                            [tag]: media.content
                        }));
                    } else if(activeTab === 'category') {
                        await updateCategories(JSON.stringify({
                            ...data,
                            [tag]: media.content
                        }));
                    }

                    onLoadedMedia && await onLoadedMedia(media);
                    setLoading(false);
                    toast(`${tag} actualizado con exito`)
                }

            };
            setLoading(true);
            await onChangeMediaToUpload(tag, uploadCallBack, `${(data as CompanyModel).companyId || data._id}-${tag}`)(event)
            setLoading(false);
        }

    const goToDashboard = () => {
        history.push('/dashboard')
    }
    const handleActiveTab = (tab: CompanyMngTabsTypes) => () => setActiveTab(tab);

    const onSearch = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        const value = data.toLowerCase().replace(/[ ]/gi, '');
        const filterObjectWithValue = (obj: any) => JSON.stringify(obj).toLowerCase().replace(/[ ]/gi, '').includes(value);
        if(activeTab === 'company') {
           // const newCompanies = companies.filter(filterObjectWithValue);
        } else if(activeTab === 'category') {
            const newCats = originalCat.filter(filterObjectWithValue);
            setCategories(newCats);
        }
    }

    return (
        <div className="company-management">
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <div className="d-flex align-items-center justify-content-between gap-3 p-3">
                <h1>Company Management</h1>
                <Button onClick={goToDashboard} color="primary">Dashboard</Button>
            </div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'company' ? 'active' : ''}`} aria-current="page" href="#"
                       onClick={handleActiveTab('company')}>Compañias</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'category' ? 'active' : ''}`} href="#"
                       onClick={handleActiveTab('category')}>Categorías</a>
                </li>
            </ul>
            <div className="orders-management-browser-wrapper p-4">
                <Input bsSize="lg" placeholder="Buscar" onChange={onSearch}/>
            </div>
            {activeTab === 'company' &&
                <CompanyList
                    updateCompany={updateCompany}
                    companies={companies}
                    updateCompanyMedia={onChangeMediaFile}
                    deleteCompany={handleDeleteCompany}
                    addCompany={handleAddNewCompany}
                />
            }
            {activeTab === 'category' &&
                <CategoryList
                    updateCategory={updateCategory}
                    categories={categories}
                    updateCategoryMedia={onChangeMediaFile}
                    deleteCategory={handleDeleteCategory}
                    addCategory={handleAddNewCategory}
                    companies={companies}
                />
            }
        </div>
    )
}