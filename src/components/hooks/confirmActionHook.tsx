import React, {useCallback} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

export function useConfirmAction<ActionsType, ActionDataType>(handleConfirmedAction: (type?: ActionsType, data?: ActionDataType) => void, handleDeniedAction?: (type?: ActionsType, data?: ActionDataType) => void) {
    const [actionDataToConfirm, setActionDataToConfirm] = React.useState<ActionDataType>();
    const [actionToConfirm, setActionToConfirm] = React.useState<ActionsType>();

    const resetActionToConfirm = () => {
        handleDeniedAction && handleDeniedAction(actionToConfirm, actionDataToConfirm)
        setActionDataToConfirm(undefined)
        setActionToConfirm(undefined)
    };

    const handleSetActionToConfirm = (type: ActionsType, data?: ActionDataType) => {
        setActionDataToConfirm(data)
        setActionToConfirm(type)
    }

    const handleConfirm = async () => {
        await handleConfirmedAction(actionToConfirm, actionDataToConfirm);
        resetActionToConfirm();
    }

    const ConfirmModal = useCallback(() => {
        return (
            <Modal isOpen={!!actionToConfirm} toggle={resetActionToConfirm}>
                <ModalHeader toggle={resetActionToConfirm}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas seguro que quieres continuar?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary"
                            onClick={handleConfirm}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetActionToConfirm}>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }, [actionDataToConfirm, actionToConfirm])

    return {
        handleSetActionToConfirm,
        resetActionToConfirm,
        ConfirmModal,
    }
}