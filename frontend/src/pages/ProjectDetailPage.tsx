import { useParams } from 'react-router-dom';

const ProjectDetailPage = () => {
  const { id } = useParams();
  return <div className="p-8 text-center text-2xl font-bold">Chi tiết dự án {id}</div>;
};

export default ProjectDetailPage;
