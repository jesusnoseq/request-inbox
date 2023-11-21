import React from 'react';
import { InboxRequest } from '../types/inbox';
import Container from '@mui/material/Container';
import RequestDetail from './RequestDetail';
type Props = {
    requests: InboxRequest[];
};

const RequestList: React.FC<Props> = ({ requests }) => {
    return (
        <Container>
            {requests.map((request, index) => (
                <React.Fragment key={request.ID}>
                    <RequestDetail request={request} />
                    {/* {index < requests.length - 1 && <Divider variant="inset" component="li" />} */}
                </React.Fragment>
            ))}
        </Container>
    );
};

export default RequestList;