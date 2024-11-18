# algonauts-devkit
Development Kit containing helper code for the Algonauts Project Challenge 2019.
This repository provides some sample code for:
1. generating and saving activations from AlexNet/VGG-19/ResNet,
2. computing Representation Dissimilarity Matrices from the activations generated above, and
3. The evaluation code with 118 image training set.

Requirements:
pytorch,
tqdm,
scipy,
Pillow

1. To generate the features run the following code:

CUDA_VISIBLE_DEVICES=0 python generate_features.py --image_dir  './78images' --save_dir  './feats'  --net alexnet


Replace './78images' by the path of the 78/92/118 image directories containing the image files in the ".jpg" format

Replace './feats' by the path where you wish to save the features
The features will be saved in the directory ./feats/78images_feats/alexnet for the above case. The feature saved are in a .mat file with fields corresponding to layers specified in the network.  

For matconvnet users run generate_feats_alexnet(image_dir,save_dir) for generating AlexNet activations. For other networks (VGG,ResNet) usage is similar

2. To compute RDMs run the following code:

python create_RDMs.py --feat_dir './feats/78images_feats/alexnet' --save_dir './rdms/78images_rdms/alexnet' --distance pearson


Replace the directory paths accordingly for features and the path to save rdms.
The RDM created are saved in the directory ./rdms/78images_rdms/alexnet/pearson/layer  . The RDMs for each layer are created in the same format as required for challenge.

3. To evaluate (use RDMs for 118 image set) modify the path of target_fmri/target_meg and submit_fmri/submit_meg RDM files in the evaluation scripts (testSub_fmri.py/testSub_meg.py) and run

testSub_meg.py to evaluate MEG RDMs

testSub_fmri.py to evaluate fMRI RDMs
