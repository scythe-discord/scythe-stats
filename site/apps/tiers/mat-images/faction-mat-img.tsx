import { FC, useState } from 'react';
import { useStyletron } from 'baseui';
import classNames from 'classnames';
import { Modal, ModalHeader, ModalBody, SIZE } from 'baseui/modal';

import { getFactionMatImg } from '../../../lib/scythe';

interface Props {
  factionName: string;
  className?: string;
}

const FactionMatImg: FC<Props> = ({ factionName, className }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [css] = useStyletron();

  return (
    <>
      <img
        src={getFactionMatImg(factionName)}
        className={classNames(
          css({
            margin: '10px 0',
            cursor: 'pointer',
          }),
          className
        )}
        alt={factionName}
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
              src={getFactionMatImg(factionName, true)}
              className={css({
                minWidth: '800px',
                width: '100%',
                padding: '15px',
              })}
              alt={factionName}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default FactionMatImg;
