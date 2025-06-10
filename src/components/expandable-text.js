import React, {useState, useRef} from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';

const ExpandableText = ({html}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textRef = useRef(null);

    const isTextTruncated = textRef?.current?.scrollHeight > textRef?.current?.clientHeight;



    return (
        <div>
            <div
                ref={textRef}
                className={isExpanded ? 'full-text' : 'truncate-text-2'}
                dangerouslySetInnerHTML={{__html: html}}
            />
            {isTextTruncated && (
                <IconButton
                    onClick={() => setIsExpanded(!isExpanded)}
                    size="small"
                    style={{
                        padding: 0,
                        marginTop: '4px',
                    }}
                >
                    {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </IconButton>
            )}
        </div>
    );
};

export default ExpandableText;