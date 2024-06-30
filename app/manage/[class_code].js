// pages/manage/[classCode].js
import { useRouter } from 'next/router';
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import ManageClassPage from '../../components/page_components/';

const ManageClass = ({ classData }) => {
  const router = useRouter();
  const { classCode } = router.query;

  // Handle the case where classData is not yet available
  if (!classData) {
    return <div>Loading...</div>;
  }

  return <ManageClassPage classData={classData} />;
};

export async function getServerSideProps(context) {
  const { classCode } = context.params;

  const { data: classData, error } = await supabaseClient
    .from('classes')
    .select('*')
    .eq('classCode', classCode)
    .single();

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      classData,
    },
  };
}

export default ManageClass;