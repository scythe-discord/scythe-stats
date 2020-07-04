import { FC, useState } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';
import { Modal, ModalBody, SIZE, ModalHeader } from 'baseui/modal';

import { getPlayerMatImg } from '../../../lib/scythe';

interface Props {
  playerMatName: string;
  className?: string;
}

const PlayerMatImg: FC<Props> = ({ playerMatName, className }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [css] = useStyletron();

  return (
    <>
      <img
        src={getPlayerMatImg(playerMatName)}
        className={classNames(
          className,
          css({
            margin: '10px 0',
            cursor: 'pointer',
          })
        )}
        alt={playerMatName}
        onClick={() => setIsModalVisible(true)}
      />
      <Modal
        onClose={() => setIsModalVisible(false)}
        isOpen={isModalVisible}
        size={SIZE.auto}
        closeable
      >
        <ModalHeader />
        <ModalBody>
          <div
            className={css({
              overflow: 'auto',
            })}
          >
            <img
              src={getPlayerMatImg(playerMatName, true)}
              className={css({
                minWidth: '800px',
                width: '100%',
                padding: '15px',
              })}
              alt={playerMatName}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PlayerMatImg;
