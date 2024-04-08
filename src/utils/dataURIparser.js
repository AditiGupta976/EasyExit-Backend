import DataURIParser from 'datauri/parser';
export const getFileType = (file) => {
    return  file.mimetype.split('/').pop();
}

export const getDataURI = async (file) => {
    const parser = new DataURIParser();
    return parser.format(getFileType(file),file.buffer);
}